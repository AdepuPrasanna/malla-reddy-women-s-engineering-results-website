import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { createAdminUser, deleteAdminUser, fetchAdminUsers, updateAdminUser } from "@/shared/lib/adminApi";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [formError, setFormError] = useState("");

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const createUser = useMutation({
    mutationFn: () => createAdminUser({ username, password, role }),
    onSuccess: () => {
      setUsername("");
      setPassword("");
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setFormError((err as Error).message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateAdminUser(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const removeUser = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin Users</h1>
        <p className="mt-2 text-muted">Create users and assign the admin role</p>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold">Create User</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            createUser.mutate();
          }}
        >
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" loading={createUser.isPending}>
            <UserPlus className="mr-2 inline h-4 w-4" />
            Create User
          </Button>
        </form>
        {formError && <p className="mt-3 text-sm text-error">{formError}</p>}
      </Card>

      {error && <div className="text-sm text-error">{(error as Error).message}</div>}

      <Card>
        <h2 className="font-display text-lg font-semibold">All Users</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted">Loading users…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-muted">
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-foreground/5">
                    <td className="py-3 pr-4 font-medium">{user.username}</td>
                    <td className="py-3 pr-4"><Badge variant="primary">{user.role}</Badge></td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.active ? "success" : "error"}>{user.active ? "Active" : "Disabled"}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => toggleActive.mutate({ id: user.id, active: !user.active })}
                        >
                          {user.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1.5 text-error"
                          onClick={() => {
                            if (window.confirm(`Delete user "${user.username}"?`)) removeUser.mutate(user.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
