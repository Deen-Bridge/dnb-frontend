"use cient";
import NextTopLoader from "nextjs-toploader";
import ProtectedRoute from "@/hooks/protected-route";
import { SidebarLeft } from "@/components/organisms/dashboard/sidebar-left"
import { SidebarRight } from "@/components/organisms/dashboard/sidebar-right"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Layout({ children }) {
    return (
        <>
            <NextTopLoader
                color="#34AD5D"
                initialPosition={0.09}
                crawlSpeed={100}
                height={3}
                crawl={false}
                showSpinner={false}
                easing="ease"
                speed={100}
                shadow="0 0 10px #34AD5D,0 0 5px #34AD5D"
            />
            <ProtectedRoute>
                <SidebarProvider>
                    <SidebarLeft />
                    <SidebarInset>
                        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
                            <div className="flex flex-1 items-center gap-2 px-3">
                                <SidebarTrigger />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="line-clamp-1">
                                                Courses , live classes , Sections
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                     {children}
                    </SidebarInset>
                    <SidebarRight />
                </SidebarProvider>
            </ProtectedRoute>
        </>
    );
}