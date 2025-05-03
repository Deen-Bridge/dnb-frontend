"use client";
import Button from "../../atoms/form/Button";
export default function AuthNavButtons() {
    const userLoggedIn = false;

    return userLoggedIn ? (
        <Button to="/dashboard/" wide round  className="bg-accent">
            Dashboard
        </Button>
    ) : (
        <>
            <div className="flex items-center gap-5">
                <Button
                    wide
                    round
                    to="/login"
                    className="bg-accent"
                >
                    Login
                </Button>
                <Button to="/signup" wide  round
                    className="bg-accent">
                    Sign up
                </Button>
            </div>

        </>
    );
}
