"use client";

import { fal } from "@/lib/fal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function FalConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const testConnection = async () => {
    setStatus("loading");
    try {
      // Simple logic calculation test on Fal
      // We'll use a very fast model or endpoint just to ping
      // For now, let's just check if we can init the client or list something if possible
      // Actually, let's try to run a very light request to a text model
      // Note: This requires FAL_KEY to be set in backend env and proxied, OR set in frontend env
      // For this demo, let's assume we are calling a Server Action that does the test
      
      const response = await fetch("/api/fal/test-connection");
      const data = await response.json();
      
      if (response.ok) {
        setStatus("success");
        setMessage(`Bağlantı Başarılı! Model: ${data.model}`);
        toast.success("Fal.ai bağlantısı doğrulandı.");
      } else {
        throw new Error(data.error || "Bağlantı hatası");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(error.message);
      toast.error("Fal.ai bağlantısı sağlanamadı.");
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/20 mt-8">
      <div className="flex-1">
        <h3 className="font-semibold text-sm">API Bağlantı Testi</h3>
        <p className="text-xs text-muted-foreground">
          Fal.ai servislerinin erişilebilirliğini kontrol et.
        </p>
        {message && (
            <p className={`text-xs mt-1 ${status === "success" ? "text-green-600" : "text-red-600"}`}>
                {message}
            </p>
        )}
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={testConnection}
        disabled={status === "loading"}
      >
        {status === "loading" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
        {status === "success" && <CheckCircle className="mr-2 h-3 w-3 text-green-500" />}
        {status === "error" && <XCircle className="mr-2 h-3 w-3 text-red-500" />}
        Test Et
      </Button>
    </div>
  );
}
