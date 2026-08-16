import { z } from "zod";

/**
 * Educator verification wizard schema.
 *
 * File fields hold browser `File` objects during editing and are swapped for
 * their signed reference strings on submit. `currentStep` is a hidden field
 * that rides along in the draft so a resumed session reopens at the right step.
 */

const isFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

const hasDocument = (data, fileField, urlField) =>
  isFile(data?.[fileField]) || !!data?.[urlField];

export const educatorApplicationSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    linkedinUrl: z
      .string()
      .min(1, "LinkedIn URL is required")
      .url("Enter a valid URL (e.g. https://linkedin.com/in/you)"),
    livenessToken: z.string().min(1, "Complete the liveness check first"),
    governmentIdFile: z.any().optional(),
    governmentIdUrl: z.string().optional(),
    teachingCertificateFile: z.any().optional(),
    teachingCertificateUrl: z.string().optional(),
    currentStep: z.number().int().min(0).optional(),
  })
  .refine((data) => hasDocument(data, "governmentIdFile", "governmentIdUrl"), {
    message: "A government ID is required",
    path: ["governmentIdFile"],
  })
  .refine(
    (data) => hasDocument(data, "teachingCertificateFile", "teachingCertificateUrl"),
    {
      message: "A teaching certificate is required",
      path: ["teachingCertificateFile"],
    }
  );

export default educatorApplicationSchema;
