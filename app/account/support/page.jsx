"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";

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
          <input
            type="file"
            name="report-file"
            id="report-file"
            placeholder="Input subject"
            className="px-4 py-[18px] hidden rounded-lg w-full border text-base font-normal border-[#D9DCE0] "
            accept="image/*"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => document.getElementById("report-file")?.click()}
            className="w-full rounded-[66px] outline-1 outline-black border-wmt-gray-100 border p-2 bg-[#FCFCFC] flex items-center justify-between cursor-pointer"
          >
            <div className="flex gap-2 items-center">
              <i className="bg-wmt-line-gray w-10 h-10 p-2 flex items-center justify-center rounded-[27px] border-wmt-line-gray border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                    stroke="#828282"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                    stroke="#828282"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.66992 18.9505L7.59992 15.6405C8.38992 15.1105 9.52992 15.1705 10.2399 15.7805L10.5699 16.0705C11.3499 16.7405 12.6099 16.7405 13.3899 16.0705L17.5499 12.5005C18.3299 11.8305 19.5899 11.8305 20.3699 12.5005L21.9999 13.9005"
                    stroke="#828282"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </i>
              <span className="font-medium text-sm text-accent">
                {image ? image.name : "File upload"}
              </span>
            </div>
            <div className="bg-wmt-green-100 py-[6px] px-3 rounded-[83px]  flex gap-2 items-center">
              <i>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <svg clip-path="url(#clip0_5797_12454)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.00065 0.832031C8.07284 0.831985 8.14419 0.847574 8.20979 0.877726C8.27539 0.907877 8.33368 0.951876 8.38065 1.0067L10.3807 3.34003C10.4669 3.44081 10.5096 3.57174 10.4994 3.70402C10.4891 3.8363 10.4268 3.95908 10.326 4.04536C10.2252 4.13165 10.0943 4.17436 9.962 4.16411C9.82972 4.15386 9.70693 4.09148 9.62065 3.9907L8.50065 2.68403V9.9987C8.50065 10.1313 8.44797 10.2585 8.3542 10.3523C8.26044 10.446 8.13326 10.4987 8.00065 10.4987C7.86804 10.4987 7.74087 10.446 7.6471 10.3523C7.55333 10.2585 7.50065 10.1313 7.50065 9.9987V2.68336L6.38065 3.9907C6.33793 4.0406 6.28579 4.0816 6.22723 4.11135C6.16866 4.14111 6.1048 4.15903 6.03931 4.16411C5.97381 4.16919 5.90796 4.16131 5.8455 4.14094C5.78305 4.12056 5.72522 4.08809 5.67532 4.04536C5.62542 4.00264 5.58442 3.95051 5.55466 3.89194C5.52491 3.83337 5.50698 3.76952 5.5019 3.70402C5.49683 3.63852 5.5047 3.57267 5.52508 3.51022C5.54545 3.44776 5.57793 3.38993 5.62065 3.34003L7.62065 1.0067C7.66763 0.951876 7.72591 0.907877 7.79151 0.877726C7.85711 0.847574 7.92846 0.831985 8.00065 0.832031ZM4.66465 5.50003C4.79726 5.49932 4.92472 5.55132 5.01899 5.64459C5.11325 5.73786 5.16661 5.86476 5.16732 5.99736C5.16802 6.12997 5.11602 6.25743 5.02276 6.3517C4.92949 6.44597 4.80259 6.49932 4.66998 6.50003C3.94132 6.50403 3.42465 6.5227 3.03198 6.5947C2.65465 6.6647 2.43532 6.77603 2.27332 6.93803C2.08865 7.1227 1.96865 7.38203 1.90265 7.87136C1.83532 8.3747 1.83398 9.04203 1.83398 9.9987V10.6654C1.83398 11.6227 1.83532 12.29 1.90265 12.7934C1.96865 13.2827 2.08932 13.5414 2.27332 13.7267C2.45798 13.9107 2.71665 14.0307 3.20665 14.0967C3.70932 14.1647 4.37732 14.1654 5.33398 14.1654H10.6673C11.624 14.1654 12.2913 14.1647 12.7953 14.0967C13.2846 14.0307 13.5433 13.9107 13.728 13.726C13.9127 13.5414 14.0326 13.2827 14.0986 12.7934C14.166 12.29 14.1673 11.6227 14.1673 10.6654V9.9987C14.1673 9.04203 14.166 8.3747 14.0986 7.8707C14.0326 7.38203 13.912 7.1227 13.728 6.93803C13.5653 6.77603 13.3467 6.6647 12.9693 6.5947C12.5766 6.5227 12.06 6.50403 11.3313 6.50003C11.2657 6.49968 11.2007 6.4864 11.1402 6.46095C11.0796 6.4355 11.0247 6.39838 10.9785 6.3517C10.9324 6.30502 10.8958 6.24971 10.871 6.18891C10.8462 6.12811 10.8336 6.06303 10.834 5.99736C10.8343 5.9317 10.8476 5.86675 10.8731 5.80623C10.8985 5.7457 10.9356 5.69077 10.9823 5.64459C11.029 5.59841 11.0843 5.56187 11.1451 5.53707C11.2059 5.51227 11.271 5.49968 11.3366 5.50003C12.058 5.50403 12.6587 5.52136 13.15 5.61136C13.6553 5.7047 14.0853 5.88136 14.4353 6.23136C14.8367 6.63203 15.0087 7.13803 15.09 7.73803C15.1673 8.31536 15.1673 9.0507 15.1673 9.96203V10.702C15.1673 11.614 15.1673 12.3487 15.09 12.9267C15.0087 13.5267 14.8367 14.032 14.4353 14.4334C14.034 14.8347 13.5287 15.0067 12.9287 15.088C12.3507 15.1654 11.6153 15.1654 10.704 15.1654H5.29732C4.38598 15.1654 3.65065 15.1654 3.07265 15.088C2.47265 15.0074 1.96732 14.8347 1.56598 14.4334C1.16465 14.032 0.992651 13.5267 0.911984 12.9267C0.833984 12.3487 0.833984 11.6134 0.833984 10.702V9.96203C0.833984 9.0507 0.833984 8.31536 0.911984 7.73736C0.991984 7.13736 1.16532 6.63203 1.56598 6.2307C1.91598 5.88136 2.34598 5.70403 2.85132 5.61136C3.34265 5.52136 3.94332 5.50403 4.66465 5.50003Z"
                      fill="#265902"
                    />
                  </svg>
                  <defs>
                    <clipPath id="clip0_5797_12454">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </i>
              <span className="text-sm font-normal text-accent ">
                Upload
              </span>
            </div>
          </button>
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