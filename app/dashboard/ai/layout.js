import Button from "@/components/atoms/form/Button";
import { AiSidebar } from "@/components/organisms/dashboard/ai/Ai-Sidebar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Share } from "lucide-react";


export default function Layout({ children }) {
  return (
    <SidebarProvider>
  <AiSidebar/>
      <SidebarInset>
        <section className="h-[calc(100vh-4rem)]  overflow-hidden">
          <div className="flex justify-between items-center gap-1 bg-background px-4">
            <div className="flex flex-col my-2">
              <h1 className="text-3xl font-semibold bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text">
                Deen Bridge AI
              </h1>
              {/* <span className="text-sm">Your personal islamic ai</span> */}
            </div>
            <div>
              <Button
                round
                className="ml-auto w-full text-sm  text-white bg-accent hover:bg-highlight"
              >
                <Share className="size-3.5 pr-3" />
                Share
              </Button>
            </div>
          </div>

          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
