"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BadgeCheck,
    Bell,
    CreditCard,
    ChevronsUpDown,
    LogOut,
    Sparkles,
    SettingsIcon
} from "lucide-react"
import Link from "next/link"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Modal from "../Modal"
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react"
import Button from "@/components/atoms/form/Button"
export function NavUser({
    user }) {
    const { isMobile } = useSidebar();
    const { logout } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const upgrade = () => {
        setModalOpen(true);
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src="/images/img1.jpeg" alt={user?.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="start"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="/images/img1.jpeg" alt={user?.name} />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={upgrade}>
                                    <Sparkles />
                                    Upgrade to Pro
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <Link href="/dashboard/account">
                                    <DropdownMenuItem>
                                        <BadgeCheck />
                                        Account
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem>
                                    <CreditCard />
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bell />
                                    Notifications
                                </DropdownMenuItem>
                                <Link href="/dashboard/settings">
                                    <DropdownMenuItem>
                                        <SettingsIcon />
                                        Settings
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                <LogOut />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Upgrade to Pro"
            >
                <Card className="w-full max-w-md shadow-xl border border-primary/20">
                    <CardHeader className="flex items-center gap-2 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-md">
                            <Sparkles className="h-8 w-8 bg-accent" />
                        </div>
                        <CardTitle className="text-lg font-semibold mt-2">Unlock Pro Features</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground text-center leading-relaxed">
                            Upgrade to Pro to access premium features and help support the ongoing development of this app.
                            <br />
                            Your contribution truly makes a difference!
                        </p>

                        <Button wide round outlined>
                            Upgrade to Pro
                        </Button>
                    </CardContent>
                </Card>
            </Modal>
        </>
    )
}
