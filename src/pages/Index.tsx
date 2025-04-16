
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { initializeVectorStore } from "@/services/setupService";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast: uiToast } = useToast();

  // Initialize the vector database on component mount
  useEffect(() => {
    const setupVectorStore = async () => {
      try {
        await initializeVectorStore();
        toast.success("System initialized", {
          description: "Connected to vector database successfully",
        });
      } catch (error) {
        console.error('Failed to initialize vector store:', error);
        toast.error("Initialization issue", {
          description: "Some features may be limited due to connection problems.",
        });
        uiToast({
          variant: "destructive",
          title: "Initialization failed",
          description: "Failed to connect to the vector database. Some features may not work correctly.",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    setupVectorStore();
  }, [uiToast]);

  return (
    <DashboardLayout />
  );
};

export default Index;
