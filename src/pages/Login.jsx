import { LoginForm } from "@/components/LoginForm";
import { StudentForm } from "@/components/StudentForm";

export default function LoginPage({ target }) {
  return (
    <div className="grid min-h-screen bg-white place-items-center">
      {target === "teacher" && <LoginForm />}
      {target === "student" && <StudentForm />}
    </div>
  );
}
