import { Toaster } from "react-hot-toast";

export default function CustomToaster() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#151725",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "16px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                },
                success: {
                    iconTheme: {
                        primary: "#FF9F43",
                        secondary: "#FFFFFF",
                    },
                    style: {
                        borderColor: "rgba(255, 159, 67, 0.2)",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#EF4444",
                        secondary: "#FFFFFF",
                    },
                    style: {
                        borderColor: "rgba(239, 68, 68, 0.2)",
                    },
                },
                loading: {
                    iconTheme: {
                        primary: "#FF9F43",
                        secondary: "#FFFFFF",
                    },
                },
            }}
        />
    );
}
