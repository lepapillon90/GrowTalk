"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string; // Optional name to identify where the error happened
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.name || 'ErrorBoundary'}:`, error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Optional: reload the page or perform other recovery logic
        // window.location.reload(); 
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-bg-paper rounded-xl border border-white/5">
                    <div className="p-3 rounded-full bg-red-500/10 text-red-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-text-primary">오류가 발생했습니다</h3>
                        <p className="text-sm text-text-secondary max-w-[250px] mx-auto">
                            {this.props.name ? `${this.props.name}에서 ` : ""}예상치 못한 문제가 발생했습니다.
                        </p>
                    </div>
                    {this.state.error && (
                        <pre className="text-[10px] text-text-tertiary bg-black/20 p-2 rounded max-w-full overflow-auto text-left">
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
