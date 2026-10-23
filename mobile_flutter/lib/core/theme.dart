import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryBlue = Color(0xFF2878F0);
  static const Color primaryDark = Color(0xFF14233D);
  static const Color secondaryTeal = Color(0xFF19A7A1);
  static const Color accentIndigo = Color(0xFF4F46E5);
  static const Color successGreen = Color(0xFF16A34A);
  static const Color warningOrange = Color(0xFFEA580C);
  static const Color dangerRed = Color(0xFFDC2626);

  static const Color backgroundLight = Color(0xFFF2F6FC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFDDE7F4);
  static const Color glassSurface = Color(0xDFFFFFFF);
  static const Color textPrimary = Color(0xFF15243B);
  static const Color textSecondary = Color(0xFF687B96);

  static const BorderRadius panelRadius = BorderRadius.all(Radius.circular(24));
  static const EdgeInsets pagePadding = EdgeInsets.symmetric(horizontal: 18);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: secondaryTeal,
        surface: surfaceWhite,
      ),
      scaffoldBackgroundColor: backgroundLight,
      canvasColor: backgroundLight,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        headlineMedium: GoogleFonts.inter(
          fontSize: 26,
          fontWeight: FontWeight.w800,
          color: textPrimary,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13.5,
          color: textPrimary,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          color: textSecondary,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: backgroundLight,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        toolbarHeight: 64,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          elevation: 2,
          shadowColor: primaryBlue.withValues(alpha: 0.24),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primaryBlue,
        foregroundColor: Colors.white,
        elevation: 5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      cardTheme: CardThemeData(
        color: glassSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: panelRadius,
          side: const BorderSide(color: cardBorder),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white.withValues(alpha: 0.82),
        selectedColor: primaryBlue,
        side: const BorderSide(color: cardBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        labelStyle: const TextStyle(color: textSecondary, fontWeight: FontWeight.w600),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xDFFFFFFF),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: cardBorder, width: 0.8),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: cardBorder, width: 0.8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryBlue, width: 1.5),
        ),
      ),
    );
  }
}

class AppPageBackground extends StatelessWidget {
  final Widget child;

  const AppPageBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFF7FAFF), Color(0xFFEDF4FC), Color(0xFFF6F8FC)],
            ),
          ),
        ),
        IgnorePointer(
          child: Stack(
            children: [
              Positioned(
                top: -130,
                right: -90,
                child: _GlowOrb(color: Color(0x6658A6FF), size: 300),
              ),
              Positioned(
                top: 300,
                left: -170,
                child: _GlowOrb(color: Color(0x4438C9C2), size: 290),
              ),
              Positioned(
                bottom: -180,
                right: -120,
                child: _GlowOrb(color: Color(0x443F7BF4), size: 300),
              ),
            ],
          ),
        ),
        Positioned.fill(child: child),
      ],
    );
  }
}

class _GlowOrb extends StatelessWidget {
  final Color color;
  final double size;

  const _GlowOrb({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return ImageFiltered(
      imageFilter: ui.ImageFilter.blur(sigmaX: 52, sigmaY: 52),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
        ),
      ),
    );
  }
}

class AppGlassPanel extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadiusGeometry borderRadius;
  final Color color;
  final Color borderColor;

  const AppGlassPanel({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = AppTheme.panelRadius,
    this.color = AppTheme.glassSurface,
    this.borderColor = AppTheme.cardBorder,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF385B87).withValues(alpha: 0.08),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: color,
              borderRadius: borderRadius,
              border: Border.all(color: borderColor, width: 0.8),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
