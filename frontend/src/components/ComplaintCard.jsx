function ComplaintCard({ complaint }) {

    const statusColors = {
        PENDING: {
            background: "#fef3c7",
            color: "#92400e",
        },

        IN_PROGRESS: {
            background: "#dbeafe",
            color: "#1e40af",
        },

        RESOLVED: {
            background: "#dcfce7",
            color: "#166534",
        },

        REJECTED: {
            background: "#fee2e2",
            color: "#991b1b",
        },
    };

    const priorityColors = {
        HIGH: "#dc2626",
        MEDIUM: "#d97706",
        LOW: "#16a34a",
    };

    const statusStyle =
        statusColors[complaint.status] ||
        statusColors.PENDING;

    return (
        <div style={styles.card}>

            <div style={styles.topRow}>
                <div>
                    <h3 style={styles.title}>
                        {complaint.title}
                    </h3>

                    <p style={styles.id}>
                        Complaint #{complaint.id}
                    </p>
                </div>

                <span
                    style={{
                        ...styles.status,
                        background: statusStyle.background,
                        color: statusStyle.color,
                    }}
                >
          {complaint.status?.replace("_", " ")}
        </span>
            </div>

            <p style={styles.description}>
                {complaint.description}
            </p>

            <div style={styles.infoGrid}>

                <div>
          <span style={styles.label}>
            Category
          </span>

                    <strong>
                        {complaint.category}
                    </strong>
                </div>

                <div>
          <span style={styles.label}>
            AI Category
          </span>

                    <strong style={styles.ai}>
                        🤖 {complaint.aiCategory}
                    </strong>
                </div>

                <div>
          <span style={styles.label}>
            Priority
          </span>

                    <strong
                        style={{
                            color:
                                priorityColors[complaint.priority] ||
                                "#64748b",
                        }}
                    >
                        {complaint.priority}
                    </strong>
                </div>

                <div>
          <span style={styles.label}>
            Location
          </span>

                    <strong>
                        {complaint.location}
                    </strong>
                </div>

            </div>

            <div style={styles.footer}>
                Submitted by {complaint.citizenEmail}
            </div>

        </div>
    );
}

const styles = {
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "22px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
    },

    title: {
        margin: 0,
        color: "#0f172a",
        fontSize: "18px",
    },

    id: {
        margin: "5px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
    },

    status: {
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
    },

    description: {
        color: "#475569",
        lineHeight: "1.6",
        margin: "18px 0",
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "15px",
        paddingTop: "15px",
        borderTop: "1px solid #f1f5f9",
    },

    label: {
        display: "block",
        color: "#94a3b8",
        fontSize: "11px",
        marginBottom: "5px",
        textTransform: "uppercase",
    },

    ai: {
        color: "#7c3aed",
    },

    footer: {
        marginTop: "18px",
        paddingTop: "12px",
        borderTop: "1px solid #f1f5f9",
        color: "#94a3b8",
        fontSize: "12px",
    },
};

export default ComplaintCard;