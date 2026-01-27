import { useNavigate } from "@tanstack/react-router";
import { iconMapper } from "@/lib/iconManager";
import { Button } from "@/components/ui/button";
export default function HeaderMenu({ role, permissions }: { role: string; permissions: string[] }) {
  const navigate = useNavigate();
  // NEX-50: whikle working on modal and notif, we simplify BO menu
  let definitivePermissions = [];
  const permissionsArray = Array.isArray(permissions) ? permissions : [];
  if (!permissionsArray.length) return null;

  const stringifiedPermissions =
    role === "admin"
      ? permissionsArray.filter(
          (permission: string) =>
            permission !== "update:user" &&
            permission !== "delete:user" &&
            permission !== "delete:articles" &&
            permission !== "validate:articles" &&
            permission !== "ship:articles",
        )
      : permissions;

  if (role === "admin") {
    definitivePermissions = stringifiedPermissions.toSpliced(3, 0, "manage:articles").toSpliced(-1, 0, "manage:user");
  } else {
    definitivePermissions = stringifiedPermissions.toSpliced(3, 1, "manage:articles");
  }

  const filteredMenu = definitivePermissions.map((permission: string, index: number) => {
    // TODO: how do we read articles > is it the same as validate article?
    if (permission === "read:articles") return null;
    const transformedPermission1 = permission.split(":")[0];
    const transformedPermission2 = permission.split(":")[1];
    const transformedPermission = `${transformedPermission1}${transformedPermission2}`;

    return (
      <li key={`menu-items-${index.toString()}`}>
        <Button
          className="navbar-item text-sm font-light"
          variant="outline"
          onClick={() =>
            navigate({
              to: `/editor/${transformedPermission}`,
              replace: true,
            })
          }
          title={` ${transformedPermission1} ${transformedPermission2}`}
        >
          {iconMapper(permission)}
          &nbsp;
          {transformedPermission1} {transformedPermission2}
        </Button>
      </li>
    );
  });

  return (
    <nav className="w-3/4 m-auto flex flex-col flex-start" aria-label="main navigation">
      <ol className="w^full pt-2 pb-2 flex flex-row justify-evenly">{filteredMenu}</ol>
      <div className="flex justify-end mr-4">
        <h4>
          <strong>Role : {role}</strong>
        </h4>
      </div>
    </nav>
  );
}
