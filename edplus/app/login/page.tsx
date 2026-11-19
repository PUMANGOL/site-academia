import { Suspense } from "react";
import Header from "../layouts/header2";
import Login from "../template-parts/login";


export default function Home() {
  return (
    <>
      <Header />
        <Suspense fallback={null}>
          <Login />
        </Suspense>
    </>
  );
}