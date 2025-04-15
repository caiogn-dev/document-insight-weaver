
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">RAG Assistant</h1>
        <p className="text-gray-600">Upload documents and start chatting!</p>
      </div>

      <FileUpload />
      <ChatInterface />
    </div>
  );
};

export default Index;
