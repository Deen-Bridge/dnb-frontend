import MessagesHeadSideList from "@/components/molecules/dashboard/messages/MessagesHeadSideList";
export default function Layout({ children }) {
  return (
    <div className="grid h-full w-full">
      <div className="flex flex-col">
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <MessagesHeadSideList />

          <div className="bg-highlight/20 rounded-xl relative hidden md:flex  h-full flex-col  p-4 lg:col-span-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
