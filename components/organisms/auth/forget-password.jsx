import React from 'react'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/atoms/form/Button';

const ForgetPassword = () => {
  return (
      <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Forget Password</h1>
              <p className="text-sm text-muted-foreground">
                  Enter your email and password
              </p>
          </div>
          <div className="grid gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                  />
              </div>

              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={handleChange}
                      required
                  />
              </div>

              <Button
                  className="bg-accent"
                  wide
                  loading={isLoading}
                  loaderColor="white"
                  loaderSize={24}
                  type="submit"
                  disabled={isLoading}
              >
                  Login
              </Button>

              <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                      Sign Up
                  </Link>
              </div>
          </div>
      </form>
  )
}

export default ForgetPassword;
