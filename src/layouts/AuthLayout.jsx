import { Suspense, cloneElement } from "react";
import { useLoaderData, useOutlet, Await, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Loading } from "@/components/Loading";

const AuthLayout = () => {
  const { user } = useLoaderData();
  const element = useOutlet();
  const location = useLocation();
  return (
    <Suspense fallback={<Loading />}>
      <Await
        resolve={user}
        errorElement={<div>Something went wrong!</div>}
        children={(user) => (
          <AuthProvider user={user}>
            {element && cloneElement(element, { key: location.pathname })}
          </AuthProvider>
        )}
      />
    </Suspense>
  );
};

export default AuthLayout;
