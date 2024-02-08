import { SignInButton } from "@clerk/clerk-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <>
      <h1>Home</h1>
      {isLoaded ? (
        <>
          {isSignedIn ? (
            <>
              <p>Hello, {user.username}</p>
              <SignOutButton />
              <br />
              <br />
              <Link href="/dashboard">Go to dashboard</Link>
              <br />
              <Link href="/client">Go to client</Link>
            </>
          ) : (
            <>
              <p>You are not signed in</p>
              <SignInButton />
              <br />
              <br />
              <Link href="/client">Go to client</Link>
            </>
          )}
        </>
      ) : (
        "Loading..."
      )}
    </>
  );
}
