import { Suspense } from "react";
import Header from "../layouts/header2";
import ResetPassword from "../template-parts/reset-password";

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
        <Suspense fallback={null}>
          <ResetPassword />
        </Suspense>
    </>
  );
}
