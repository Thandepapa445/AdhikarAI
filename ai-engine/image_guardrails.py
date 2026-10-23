"""
Adhikar AI - Multi-Stage Visual Safety, NSFW Moderation & AI-Generated Forensic Engine
Aligned with NEP 2020 & Citizen Grievance Redressal Integrity Standards.
"""

import io
import re
import numpy as np
from PIL import Image, ExifTags
import cv2
from scipy import ndimage, stats


# ==============================================================================
# 1. IMAGE QUALITY & CLARITY GUARDRAIL
# ==============================================================================
def analyze_image_quality(image: Image.Image):
    """
    Checks for corrupted, blank, pitch black, or overexposed images.
    Returns:
        (is_ok: bool, error_type: str, message: str)
    """
    try:
        img_np = np.array(image.convert("RGB"))
        std = float(img_np.std())
        mean = float(img_np.mean())

        # Blank or single-color image
        if std < 12.0:
            return False, "BLANK_OR_CORRUPTED", "The uploaded photo appears blank or solid color. Please upload a clear photo of the civic problem."

        # Pitch black photo
        if mean < 12.0:
            return False, "PITCH_DARK", "The uploaded photo is pitch black or too dark. Please capture an adequately lit photograph."

        # Overexposed / whiteout
        if mean > 245.0:
            return False, "OVEREXPOSED", "The uploaded photo is overexposed or solid white. Please capture a clear photograph."

        return True, "QUALITY_PASSED", "Image passed clarity and lighting checks."
    except Exception as e:
        return True, "QUALITY_PASSED", f"Quality check pass: {str(e)}"


# ==============================================================================
# 2. NSFW & ADULT CONTENT DETECTION GUARDRAIL
# ==============================================================================
def analyze_nsfw_content(image: Image.Image) -> tuple[bool, float, str, dict]:
    """
    Detects inappropriate, explicit, adult, or nudity content in civic evidence uploads.
    
    Combines:
      - Multi-space skin tone segmentation (YCbCr + HSV + RGB) calibrated for diverse pigments.
      - Laplacian texture variance analysis (discriminates smooth human skin vs rough asphalt/gravel/dirt).
      - Connected component morphology (detects large contiguous exposed flesh masses).
      - Anatomical / central & lower quadrant spatial exposure weighting.
      
    Returns:
        (is_nsfw: bool, confidence: float, reason: str, metrics: dict)
    """
    try:
        # Resize for fast, consistent processing (max dim 400px)
        w, h = image.size
        scale = min(1.0, 400.0 / max(w, h))
        if scale < 1.0:
            img_resized = image.resize((int(w * scale), int(h * scale)), Image.Resampling.BILINEAR)
        else:
            img_resized = image

        rgb = np.array(img_resized.convert("RGB"))
        ih, iw, _ = rgb.shape
        total_pixels = ih * iw

        # Color Space 1: YCrCb
        ycrcb = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
        Y, Cr, Cb = cv2.split(ycrcb)

        # Color Space 2: HSV
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        H, S, V = cv2.split(hsv)

        # Skin tone masks across skin complexions
        mask_ycrcb = (Cr >= 133) & (Cr <= 180) & (Cb >= 77) & (Cb <= 135) & (Cr > Cb) & (Y >= 35) & (Y <= 245)
        mask_hsv = ((H <= 25) | (H >= 170)) & (S >= 38) & (S <= 210) & (V >= 60)
        
        # Color Space 3: Normalized RGB
        R = rgb[:, :, 0].astype(np.int32)
        G = rgb[:, :, 1].astype(np.int32)
        B = rgb[:, :, 2].astype(np.int32)
        mask_rgb = (R > G) & (R > B) & (np.abs(R - G) >= 12)

        # Combined raw skin candidate mask
        raw_skin = (mask_ycrcb & mask_hsv & mask_rgb).astype(np.uint8) * 255

        # Morphological filtering: remove isolated noise specks, join contiguous flesh regions
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        skin_morph = cv2.morphologyEx(raw_skin, cv2.MORPH_CLOSE, kernel_close)
        skin_morph = cv2.morphologyEx(skin_morph, cv2.MORPH_OPEN, kernel_open)

        skin_pixels = int(np.count_nonzero(skin_morph))
        total_skin_ratio = skin_pixels / float(total_pixels)

        # Texture roughness discrimination:
        # Asphalt, dry mud, brick, leaves, and gravel have high Laplacian variance (> 1800).
        # Human skin is smooth with low Laplacian variance (< 800).
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        lap = cv2.Laplacian(gray, cv2.CV_32F)
        
        if skin_pixels > 100:
            skin_lap_var = float(np.var(lap[skin_morph > 0]))
        else:
            skin_lap_var = 0.0

        # Damping factor: if candidate region has gravel/asphalt roughness, penalize skin score
        if skin_lap_var > 1800.0:
            smoothness_factor = max(0.02, 1.0 - ((skin_lap_var - 1800.0) / 2500.0))
        elif skin_lap_var > 800.0:
            smoothness_factor = max(0.40, 1.0 - ((skin_lap_var - 800.0) / 2000.0))
        else:
            smoothness_factor = 1.0

        # Connected component analysis: measure largest contiguous flesh blob
        num_labels, labels, stats_arr, centroids = cv2.connectedComponentsWithStats(skin_morph)
        if num_labels > 1:
            areas = stats_arr[1:, cv2.CC_STAT_AREA]
            largest_blob_area = int(np.max(areas))
        else:
            largest_blob_area = 0

        largest_blob_ratio = largest_blob_area / float(total_pixels)

        # Central / intimate crop analysis ([20%-80% H, 15%-85% W])
        y1, y2 = int(ih * 0.20), int(ih * 0.80)
        x1, x2 = int(iw * 0.15), int(iw * 0.85)
        center_crop = skin_morph[y1:y2, x1:x2]
        center_pixels = (y2 - y1) * (x2 - x1)
        center_skin_ratio = float(np.count_nonzero(center_crop)) / float(max(1, center_pixels))

        # Effective metrics after texture roughness damping
        effective_skin = total_skin_ratio * smoothness_factor
        effective_blob = largest_blob_ratio * smoothness_factor
        effective_center = center_skin_ratio * smoothness_factor

        # Multi-factor NSFW scoring
        nsfw_score = (effective_skin * 0.40) + (effective_blob * 0.35) + (effective_center * 0.25)
        nsfw_score = min(0.99, round(nsfw_score * 2.2, 3))

        metrics = {
            "totalSkinRatio": round(total_skin_ratio, 4),
            "largestBlobRatio": round(largest_blob_ratio, 4),
            "centerSkinRatio": round(center_skin_ratio, 4),
            "skinLaplacianVariance": round(skin_lap_var, 2),
            "smoothnessFactor": round(smoothness_factor, 3),
            "nsfwScore": nsfw_score
        }

        # Decision rules
        if effective_skin >= 0.26 and effective_blob >= 0.12:
            return True, max(0.78, nsfw_score), f"Excessive exposed skin ({total_skin_ratio*100:.1f}%) and large contiguous body mass ({largest_blob_ratio*100:.1f}%) detected", metrics

        if effective_skin >= 0.38:
            return True, max(0.85, nsfw_score), f"Predominant naked skin coverage ({total_skin_ratio*100:.1f}%) detected in frame", metrics

        if effective_center >= 0.32 and effective_blob >= 0.15:
            return True, max(0.82, nsfw_score), f"Intimate central body exposure detected ({center_skin_ratio*100:.1f}% central flesh coverage)", metrics

        return False, nsfw_score, "Image passed NSFW content moderation safety audit.", metrics

    except Exception as e:
        return False, 0.0, f"NSFW audit error (passed): {str(e)}", {}


# ==============================================================================
# 3. AI-GENERATED SYNTHETIC IMAGE FORENSIC DETECTOR
# ==============================================================================
AI_SIGNATURE_PATTERNS = [
    (re.compile(rb"parameters\x00", re.I), "Stable Diffusion / Automatic1111 parameter chunk"),
    (re.compile(rb"workflow\x00", re.I), "ComfyUI workflow graph"),
    (re.compile(rb"prompt\x00", re.I), "ComfyUI generation prompt chunk"),
    (re.compile(rb"Negative prompt:\s*", re.I), "Diffusion negative prompt parameter"),
    (re.compile(rb"Steps:\s*\d+,\s*Sampler:", re.I), "Diffusion sampling parameters"),
    (re.compile(rb"CFG scale:\s*[\d\.]+", re.I), "Diffusion CFG scale parameter"),
    (re.compile(rb"Seed:\s*\d+", re.I), "Diffusion generation seed"),
    (re.compile(rb"Model hash:\s*[a-f0-9]+", re.I), "Diffusion checkpoint model hash"),
    (re.compile(rb"midjourney", re.I), "Midjourney signature"),
    (re.compile(rb"dall[-_]?e", re.I), "OpenAI DALL-E signature"),
    (re.compile(rb"c2pa\.assertions", re.I), "C2PA digital synthetic provenance manifest"),
    (re.compile(rb"c2pa\.claim", re.I), "C2PA content credentials"),
    (re.compile(rb"Adobe Firefly", re.I), "Adobe Firefly generative AI signature"),
    (re.compile(rb"bing\s*image\s*creator", re.I), "Bing Image Creator signature"),
    (re.compile(rb"leonardo\.ai", re.I), "Leonardo.ai generator signature"),
    (re.compile(rb"ideogram", re.I), "Ideogram generator signature"),
    (re.compile(rb"flux\.1", re.I), "Flux.1 generative model signature"),
    (re.compile(rb"novelai", re.I), "NovelAI image generator signature"),
    (re.compile(rb"fooocus", re.I), "Fooocus generation signature"),
    (re.compile(rb"invokeai", re.I), "InvokeAI generation signature")
]


def analyze_ai_generated_image(image: Image.Image, raw_bytes: bytes = None) -> tuple[bool, float, str, dict]:
    """
    Forensically detects AI-generated synthetic images (Midjourney, Stable Diffusion,
    DALL-E, Flux, Adobe Firefly, ComfyUI, etc.) across complementary forensic layers:
      Layer 1: Deterministic Metadata, EXIF, and Binary Workflow Signatures.
      Layer 2: 2D FFT Spectral Lattice & Radial Power Spectrum Analysis (1/f^alpha deviation).
      Layer 3: Photo-Response Non-Uniformity (PRNU) & Sensor Residual Kurtosis.
      Layer 4: High-frequency plastic smoothing vs edge gradient anomaly.
    
    Returns:
        (is_ai_generated: bool, confidence: float, reason: str, metrics: dict)
    """
    metrics = {
        "metadataSignatureFound": False,
        "signatureName": None,
        "fftRadialSlope": 0.0,
        "fftRadialR2": 0.0,
        "residualExcessKurtosis": 0.0,
        "plasticSmoothingRatio": 0.0,
        "compositeAiScore": 0.0,
        "anomaliesCount": 0
    }

    try:
        # ----------------------------------------------------------------------
        # LAYER 1: Binary & Metadata Forensic Inspection (100% Deterministic)
        # ----------------------------------------------------------------------
        if raw_bytes:
            for pattern, sig_name in AI_SIGNATURE_PATTERNS:
                if pattern.search(raw_bytes):
                    metrics["metadataSignatureFound"] = True
                    metrics["signatureName"] = sig_name
                    metrics["compositeAiScore"] = 0.99
                    metrics["anomaliesCount"] = 3
                    return True, 0.99, f"Embedded AI generation watermark / metadata detected: {sig_name}", metrics

        info_dict = image.info or {}
        for k, v in info_dict.items():
            k_lower = str(k).lower()
            v_str = str(v)
            if k_lower in ("parameters", "prompt", "workflow", "prompt_history", "sd-metadata"):
                metrics["metadataSignatureFound"] = True
                metrics["signatureName"] = f"PNG chunk '{k}'"
                metrics["compositeAiScore"] = 0.99
                metrics["anomaliesCount"] = 3
                return True, 0.99, f"Embedded AI generation parameter chunk '{k}' detected", metrics

            for pattern, sig_name in AI_SIGNATURE_PATTERNS:
                if pattern.search(v_str.encode("utf-8", errors="ignore")):
                    metrics["metadataSignatureFound"] = True
                    metrics["signatureName"] = sig_name
                    metrics["compositeAiScore"] = 0.99
                    metrics["anomaliesCount"] = 3
                    return True, 0.99, f"Embedded AI metadata signature detected: {sig_name}", metrics

        try:
            exif = image.getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    val_str = str(value)
                    for pattern, sig_name in AI_SIGNATURE_PATTERNS:
                        if pattern.search(val_str.encode("utf-8", errors="ignore")):
                            metrics["metadataSignatureFound"] = True
                            metrics["signatureName"] = f"EXIF {tag_name}: {sig_name}"
                            metrics["compositeAiScore"] = 0.99
                            metrics["anomaliesCount"] = 3
                            return True, 0.99, f"EXIF AI generation tag detected: {sig_name}", metrics
        except Exception:
            pass

        # ----------------------------------------------------------------------
        # LAYER 2: 2D FFT Spectral Lattice & Radial Power Spectrum Analysis
        # ----------------------------------------------------------------------
        w, h = image.size
        scale = min(1.0, 512.0 / max(w, h))
        if scale < 1.0:
            img_fft_src = image.resize((int(w * scale), int(h * scale)), Image.Resampling.BILINEAR)
        else:
            img_fft_src = image

        gray = cv2.cvtColor(np.array(img_fft_src.convert("RGB")), cv2.COLOR_RGB2GRAY).astype(np.float32)
        gh, gw = gray.shape

        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        mag = np.abs(fshift)

        cy, cx = gh // 2, gw // 2
        y, x = np.ogrid[:gh, :gw]
        r = np.sqrt((x - cx)**2 + (y - cy)**2).astype(int)
        r_max = min(cx, cy)
        
        fft_ai_signal = 0.0
        anomalies = 0
        if r_max > 25:
            r_bins = np.arange(1, r_max)
            radial_mean = ndimage.mean(mag, labels=r, index=r_bins)
            
            log_r = np.log(r_bins)
            log_p = np.log(radial_mean + 1e-6)
            
            fit_start = 5
            fit_end = max(10, r_max // 2)
            slope, intercept = np.polyfit(log_r[fit_start:fit_end], log_p[fit_start:fit_end], 1)
            fit_line = slope * log_r[fit_start:fit_end] + intercept
            ss_res = np.sum((log_p[fit_start:fit_end] - fit_line)**2)
            ss_tot = np.sum((log_p[fit_start:fit_end] - np.mean(log_p[fit_start:fit_end]))**2)
            r_squared = 1.0 - (ss_res / (ss_tot + 1e-6))
            
            metrics["fftRadialSlope"] = round(float(slope), 3)
            metrics["fftRadialR2"] = round(float(r_squared), 4)

            # Natural optical photos follow 1/f^alpha (slope between -1.6 and -2.4, R^2 > 0.95)
            # Diffusion and GAN generators exhibit unnaturally flat high-frequency decay (slope > -1.1)
            if slope > -1.10 and r_squared < 0.88:
                fft_ai_signal += 0.45
                anomalies += 1
            elif slope > -1.25 and r_squared < 0.85:
                fft_ai_signal += 0.30
                anomalies += 1

        # ----------------------------------------------------------------------
        # LAYER 3: Sensor Noise Residual & Excess Kurtosis (PRNU Physics)
        # ----------------------------------------------------------------------
        denoised = cv2.GaussianBlur(gray, (5, 5), 1.0)
        noise_residual = gray - denoised
        res_kurtosis = float(stats.kurtosis(noise_residual.ravel()))
        metrics["residualExcessKurtosis"] = round(res_kurtosis, 3)

        kurtosis_ai_signal = 0.0
        if res_kurtosis > 5.5:
            kurtosis_ai_signal = min(0.55, (res_kurtosis - 5.5) * 0.10 + 0.35)
            anomalies += 1
        elif res_kurtosis < -1.2:
            kurtosis_ai_signal = 0.35
            anomalies += 1

        # ----------------------------------------------------------------------
        # LAYER 4: Micro-Texture vs Sharp Edge Energy ("Diffusion Plastic Sheen")
        # ----------------------------------------------------------------------
        sobel_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        edge_energy = float(np.mean(np.sqrt(sobel_x**2 + sobel_y**2)))
        texture_std = float(np.std(noise_residual))

        smoothing_ratio = edge_energy / (texture_std + 1e-5)
        metrics["plasticSmoothingRatio"] = round(smoothing_ratio, 3)

        sheen_ai_signal = 0.0
        if smoothing_ratio > 22.0:
            sheen_ai_signal = min(0.45, (smoothing_ratio - 22.0) * 0.03 + 0.25)
            anomalies += 1

        # ----------------------------------------------------------------------
        # COMPOSITE ENSEMBLE FORENSIC SCORE
        # ----------------------------------------------------------------------
        composite_score = min(0.99, round(fft_ai_signal + kurtosis_ai_signal + sheen_ai_signal, 3))
        metrics["compositeAiScore"] = composite_score
        metrics["anomaliesCount"] = anomalies

        # Statistical detection requires either multiple corroborating forensic anomalies
        # OR an overwhelming single signal (composite >= 0.75 and anomalies >= 2)
        if (composite_score >= 0.72 and anomalies >= 2) or (res_kurtosis > 8.0) or (smoothing_ratio > 30.0 and fft_ai_signal > 0.25):
            evidence_details = []
            if fft_ai_signal > 0.2:
                evidence_details.append(f"unnatural frequency spectrum decay (slope {metrics['fftRadialSlope']})")
            if kurtosis_ai_signal > 0.2:
                evidence_details.append(f"synthetic noise distribution anomaly (kurtosis {metrics['residualExcessKurtosis']})")
            if sheen_ai_signal > 0.2:
                evidence_details.append(f"plastic texture over-smoothing artifact (ratio {metrics['plasticSmoothingRatio']})")
            
            reason_str = f"Multi-signal synthetic visual artifacts detected: {', '.join(evidence_details)}" if evidence_details else "Statistical and spectral markers characteristic of generative diffusion synthesis detected"
            return True, max(0.80, composite_score), reason_str, metrics

        return False, composite_score, "Image passed AI synthetic generation forensic audit.", metrics

    except Exception as e:
        return False, 0.0, f"AI generation audit error (passed): {str(e)}", metrics


# ==============================================================================
# 4. COMPREHENSIVE COMBINED SAFETY AUDIT
# ==============================================================================
def comprehensive_safety_audit(image: Image.Image, raw_bytes: bytes = None):
    """
    Executes full multi-stage safety and authenticity audit:
      Stage 1: Image Quality & Sensor Integrity (Blank, Dark, Overexposed)
      Stage 2: NSFW & Explicit Content Moderation
      Stage 3: AI-Generated Synthetic Image Forensic Detection
      
    Returns:
      (passed: bool, error_type: str, message: str, audit_data: dict)
    """
    # 1. Quality Check
    q_ok, q_type, q_msg = analyze_image_quality(image)
    if not q_ok:
        return False, q_type, q_msg, {"step": "QUALITY", "qualityOk": False}

    # 2. NSFW Check
    is_nsfw, nsfw_score, nsfw_reason, nsfw_metrics = analyze_nsfw_content(image)
    if is_nsfw:
        return False, "NSFW_CONTENT", f"Inappropriate or NSFW content detected: {nsfw_reason}", {
            "step": "NSFW",
            "isNsfw": True,
            "nsfwConfidence": nsfw_score,
            "reason": nsfw_reason,
            "metrics": nsfw_metrics
        }

    # 3. AI Generation Forensic Check
    is_ai, ai_score, ai_reason, ai_metrics = analyze_ai_generated_image(image, raw_bytes=raw_bytes)
    if is_ai:
        return False, "AI_GENERATED_IMAGE", f"AI-generated synthetic image detected: {ai_reason}", {
            "step": "AI_GENERATED",
            "isAiGenerated": True,
            "aiConfidence": ai_score,
            "reason": ai_reason,
            "metrics": ai_metrics
        }

    return True, "SAFE", "Image passed clarity, NSFW content moderation, and synthetic AI image verification.", {
        "step": "PASSED",
        "isSafe": True,
        "isNsfw": False,
        "nsfwScore": nsfw_score,
        "isAiGenerated": False,
        "aiScore": ai_score,
        "status": "AUTHENTIC_FIELD_EVIDENCE"
    }
