"use client";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/atoms/form/Button";

const SupportPage = () => {
  const [form, setForm] = useState({
    category: "",
    subject: "",
    message: "",
    file: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Support ticket submitted!");
    // TODO: Send to Supabase, backend, etc.
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-primary">Need Help? Contact Support</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Select */}
        <div className="space-y-2">
          <Label htmlFor="category">Issue Category</Label>
          <Select
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Subject Input */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            name="subject"
            placeholder="Short title of your issue"
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            name="message"
            rows={5}
            placeholder="Describe the issue in detail..."
            onChange={handleInputChange}
            required
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">Attach a file (optional)</Label>
          <Input
            name="file"
            type="file"
            accept="image/*,.pdf"
            onChange={handleInputChange}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-highlight hover:bg-accent">
          Submit Ticket
        </Button>
      </form>
    </div>
  );
};

export default SupportPage;
