"use client";
import Button from "../../atoms/form/Button";
export default function AuthNavButtons() {
    const userLoggedIn = true;

    return userLoggedIn ? (
        <Button to="/dashboard/" wide round  className="bg-accent hover:bg-highlight text-white px-10 py-3">
            Dashboard
        </Button>
    ) : (
        <>
            <div className="flex items-center gap-5">
                <Button
                    wide
                    round
                    to="/login"
                    className="bg-accent hover:bg-highlight text-white px-10 py-3"    
                >
                    Login
                </Button>
                <Button to="/signup" wide  round
                    className="bg-accent hover:bg-highlight text-white px-10 py-3"    >
                    Sign up
                </Button>
            </div>

        </>
    );
}
