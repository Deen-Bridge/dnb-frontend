"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import FileInput from "@/components/atoms/form/FileInput";

const ReportIssue = () => {
  const [modal, setModal] = useState(false);
  const modalHandler = () => setModal(!modal);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleImageChange = (e) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

  };
  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <h3 className="mx-auto text-center text-2xl font-bold mt-6">
        What are you having issue with ? <br /> our team, is always available to attend
        to it
      </h3>
      <form
        onSubmit={handleSubmit}
        className="mt-12 flex flex-col gap-6 w-[calc(100%_-_100px)] mx-auto"
      >
        <label htmlFor="report-subject" className="">
          <span className="text-base mb-1 font-medium text-wmt-gray-400 block">
            Subject
          </span>
          <Input
            type="text"
            id="report-subject"
            name="report-subject"
            placeholder="Input subject"
            onChange={(e) => setSubject(e.target.value)}
            required
            className="px-4 py-4 rounded-lg w-full border text-base font-normal border-[#D9DCE0]"
          />
        </label>
        <label htmlFor="report-description" className="">
          <span className="text-base mb-1 font-medium text-wmt-gray-400 block">
            Description
          </span>
          <Textarea
            name="report-description"
            id="report-description"
            placeholder="Explain what is happening here"
            className="px-4 py-[18px] rounded-lg h-[120px] w-full  outline-none focus:outline-none border text-base font-normal border-[#D9DCE0]"
            onChange={(e) => setDescription(e.target.value)}
            required
          ></Textarea>
        </label>
        <label htmlFor="report-file" className="">
          <span className="text-base mb-1 font-medium text-wmt-gray-400 block">
            Upload file
            <span className="text-wmt-gray-500 text-sm">
              (This will help our team to understand the issue more)
            </span>
          </span>
          <FileInput id="report-file" file={image} onChange={handleImageChange} />
        </label>
        <Button
          wide
          loading={loading}
          type="submit"
          className="bg-accent hover:bg-highlight transition delay-75 mt-12 py-3 font-medium flex items-center justify-center rounded-full text-white  "
        >
          Create a ticket
        </Button>
      </form>
    </div>
  );
};
export default ReportIssue;