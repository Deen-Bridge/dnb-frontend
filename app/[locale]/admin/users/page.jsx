"use client";

import { useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  UserX,
  MoreVertical,
  UserCheck,
  Crown,
} from "lucide-react";
import { banUser } from "@/lib/actions/admin-users";
import StepUpConfirmModal from "@/components/admin/StepUpConfirmModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mockAdminUsers = [
  {
    id: "usr_001",
    name: "Ahmad Patel",
    email: "ahmad@deenbridge.org",
    role: "student",
    status: "active",
    walletAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "usr_002",
    name: "Bilal Karim",
    email: "bilal@deenbridge.org",
    role: "staff",
    status: "active",
    walletAddress: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
    createdAt: "2025-02-01T14:30:00Z",
  },
  {
    id: "usr_003",
    name: "Zaynab Idris",
    email: "zaynab@deenbridge.org",
    role: "educator",
    status: "active",
    walletAddress: "GC3BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q111",
    createdAt: "2025-03-12T09:15:00Z",
  },
];

export default function AdminUsersManagementPage() {
  const [users, setUsers] = useState(mockAdminUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);

  // Modal open states
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const handleOpenBanModal = (user) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const handleOpenRoleModal = (user, newRole) => {
    setSelectedUser(user);
    setPendingRole(newRole);
    setRoleModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) return;
    try {
      const result = await banUser(selectedUser.id, {
        email: selectedUser.email,
        reason: "Admin moderation ban via step-up verification",
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "banned" } : u))
      );
      toast.success(`User ${selectedUser.email} has been banned.`);
    } catch (err) {
      toast.error("Failed to execute user ban.");
    }
  };

  const handleConfirmRoleGrant = async () => {
    if (!selectedUser || !pendingRole) return;
    try {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: pendingRole } : u
        )
      );
      toast.success(
        `Role '${pendingRole.toUpperCase()}' granted to ${selectedUser.email}.`
      );
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={Users}
        title="Admin User Moderation & Roles"
        subtitle="Manage user accounts, ban operations, and role grants with step-up verification"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Users ({users.length})</CardTitle>
          <CardDescription>
            High-privilege admin operations require step-up phrase confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table aria-label="User moderation table">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-xs font-bold">
                            {u.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize font-semibold">
                        {u.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize font-medium",
                          u.status === "banned"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30"
                        )}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {u.walletAddress ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-6)}` : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenRoleModal(u, "super_admin")}>
                            <Crown className="h-4 w-4 mr-2 text-amber-500" />
                            Grant Super Admin Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenRoleModal(u, "staff")}>
                            <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                            Grant Staff Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenBanModal(u)}
                            className="text-red-600 focus:text-red-600"
                            disabled={u.status === "banned"}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Ban User Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ban Flow Step-Up Confirmation Modal */}
      {selectedUser && (
        <StepUpConfirmModal
          open={banModalOpen}
          onOpenChange={setBanModalOpen}
          title="Confirm User Ban"
          description="Banning this user will immediately revoke access and suspend all active platform capabilities. Type the phrase below to authorize."
          targetName={selectedUser.email}
          actionVerb="BAN"
          expectedPhrase={`BAN ${selectedUser.email}`}
          confirmVariant="destructive"
          confirmText="Ban User"
          onConfirm={handleConfirmBan}
          rateLimitKey="admin_user_ban"
        />
      )}

      {/* Role Grant Flow Step-Up Confirmation Modal */}
      {selectedUser && pendingRole && (
        <StepUpConfirmModal
          open={roleModalOpen}
          onOpenChange={setRoleModalOpen}
          title="Confirm Privilege Elevation / Role Grant"
          description={`Granting the '${pendingRole.toUpperCase()}' role assigns administrative capabilities to this account. Type the phrase below to authorize.`}
          targetName={selectedUser.email}
          actionVerb="GRANT"
          expectedPhrase={`GRANT ${pendingRole.toUpperCase()} ${selectedUser.email}`}
          confirmVariant="default"
          confirmText="Grant Role"
          onConfirm={handleConfirmRoleGrant}
          rateLimitKey="admin_role_grant"
        />
      )}
    </PageShell>
  );
}
