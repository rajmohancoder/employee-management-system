"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, UploadCloud, Save, Plus, Trash2, RefreshCw, IndianRupee, User, Fingerprint, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { enIN } from "date-fns/locale"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
// Ensure you have this component or use standard Select if not available.
// Since we saw multi-select.tsx in the directory, we'll try to use it, or fallback to checkboxes.
// For now, I'll stick to a simple multi-selection using Checkboxes if I can, OR standard implementation.
// Wait, I saw multi-select.tsx! Let's import it.
import { MultiSelect } from "@/components/ui/multi-select"

// --- Constants ---
const BANKS = ["SBI", "HDFC", "ICICI", "AXIS", "KOTAK", "OTHERS"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const IDENTITY_PROOFS = ["AADHAR", "PAN", "VOTER ID", "DRIVING LICENSE"] as const;

// --- Mock Data for States & Cities ---
// --- Mock Data for States & Cities ---
const STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Telangana"] as const;
const CITIES: Record<string, string[]> = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
};

const MANAGERS = [
    { name: "Rajesh Kumar", initials: "RK", color: "bg-blue-500" },
    { name: "Priya Sharma", initials: "PS", color: "bg-purple-500" },
    { name: "Amit Patel", initials: "AP", color: "bg-green-500" },
    { name: "Neha Gupta", initials: "NG", color: "bg-pink-500" },
    { name: "Vikram Singh", initials: "VS", color: "bg-orange-500" }
];

const JOB_TITLES = [
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "UX Designer",
    "QA Engineer",
    "HR Specialist",
    "Finance Analyst",
    "Marketing Specialist",
    "Sales Executive",
    "Customer Support",
    "Other"
] as const;

const RELATIONSHIPS = ["mother", "father", "brother", "sister", "spouse", "friend", "cousin", "child", "other"] as const;

const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

    if (cleaned.length === 0) return "";
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

const formatYear = (value: string): string => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    return cleaned;
};

// --- Schema ---
const employeeFormSchema = z.object({
    firstName: z.string()
        .min(1, "Please enter your first name")
        .min(2, "First name must be at least 2 characters")
        .max(30, "First name must not exceed 30 characters")
        .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
    lastName: z.string()
        .min(1, "Please enter your last name")
        .max(30, "Last name must not exceed 30 characters")
        .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
    profilePicture: z.any()
        .refine((file) => file, "Profile picture is required")
        .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max file size is 2MB")
        .refine(
            (file) => !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
            "Only .jpg, .jpeg, .png formats are supported"
        ),
    dob: z.date({ message: "Please select your date of birth" })
        .refine((date) => {
            const today = new Date();
            const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            return date <= eighteenYearsAgo;
        }, "Age should be greater than 18 years"),
    bloodGroup: z.string().min(1, "Please select your blood group"),
    gender: z.enum(["male", "female", "other"], { message: "Please select your gender" }),
    maritalStatus: z.string().optional(),
    numberOfDependents: z.string().optional(),
    state: z.string().min(1, "Please select your state"),
    city: z.string().min(1, "Please select your city"),
    email: z.string().min(1, "Please enter your email address").email("Please enter a valid email address"),
    phone: z.string().min(1, "Please enter your phone number").regex(/^\d{5}\s\d{5}$/, "Phone number must be 10 digits"),
    address: z.string().optional(),

    emergencyContacts: z.array(z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters")
            .max(30, "Name must not exceed 30 characters")
            .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
        relationship: z.string().min(1, "Please select relationship"),
        phone: z.string().min(1, "Please enter phone number").regex(/^\d{5}\s\d{5}$/, "Phone number must be 10 digits"),
    })).min(1, "Please add at least one emergency contact").max(2, "Maximum 2 emergency contacts allowed"),

    jobTitle: z.string().min(1, "Please enter job title").min(2, "Job title must be at least 2 characters"),
    department: z.string().min(1, "Please select a department"),
    employeeId: z.string().optional(),
    reportingManager: z.string().optional(),
    hireDate: z.date({ message: "Please select the hire date" }),
    annualCompensation: z.string().default(""),

    bankName: z.enum(["SBI", "HDFC", "ICICI", "AXIS", "KOTAK", "OTHERS"]).optional(),
    panCardNumber: z.string().optional(),
    bankAccountName: z.string().optional(),
    bankAccount: z.string().optional(),
    ifscCode: z.string().optional(),
    branchName: z.string().optional(),
    micrCode: z.string().optional(),
    bankDoc: z.any().optional(),
    resume: z.any()
        .optional()
        .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
        .refine(
            (file) => !file || ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
            "Only .pdf, .doc, .docx formats are supported"
        ),

    identityProofTypes: z.array(z.string()).min(1, "Please select at least one ID proof type"),
    identityProofFiles: z.array(z.any())
        .min(1, "Please upload at least one identity proof document")
        .refine((files) => files?.every((file: any) => file.size <= 5 * 1024 * 1024), "Max file size is 5MB per file")
        .refine((files) => files?.every((file: any) => file.type === "application/pdf"), "Only .pdf files are allowed for identity proofs"),

    qualifications: z.array(z.object({
        degree: z.string()
            .min(2, "Degree must be at least 2 characters")
            .max(30, "Degree must not exceed 30 characters")
            .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
        institution: z.string()
            .min(2, "Institution must be at least 2 characters")
            .max(30, "Institution must not exceed 30 characters")
            .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed"),
        passingYear: z.string().regex(/^(19|20)\d{2}$/, "Year must be in YYYY format (19XX or 20XX)"),
    })).max(3, "Maximum 3 qualifications allowed"),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export default function AddEmployeePage() {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [employeeIdError, setEmployeeIdError] = useState<string>("");
    const [isEmployeeIdGenerated, setIsEmployeeIdGenerated] = useState<boolean>(false);
    const [managerSearchOpen, setManagerSearchOpen] = useState(false);
    const [stateSearchOpen, setStateSearchOpen] = useState(false);
    const [citySearchOpen, setCitySearchOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);
    const [qualDeleteDialogOpen, setQualDeleteDialogOpen] = useState(false);
    const [qualToDelete, setQualToDelete] = useState<number | null>(null);
    const [bankDocFile, setBankDocFile] = useState<File | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [identityFiles, setIdentityFiles] = useState<File[]>([]);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [submittedData, setSubmittedData] = useState<EmployeeFormValues | null>(null);

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema) as any,
        mode: "onBlur",
        defaultValues: {
            firstName: "",
            lastName: "",
            profilePicture: null,
            dob: eighteenYearsAgo,
            bloodGroup: "",
            gender: "male",
            maritalStatus: "",
            numberOfDependents: "0",
            state: "",
            city: "",
            email: "",
            phone: "",
            address: "",
            jobTitle: "",
            department: "",
            employeeId: "",
            reportingManager: "",
            hireDate: today,
            annualCompensation: "",
            bankName: undefined,
            panCardNumber: "",
            bankAccountName: "",
            bankAccount: "",
            ifscCode: "",
            branchName: "",
            micrCode: "",
            bankDoc: undefined,
            resume: undefined,
            identityProofTypes: [],
            identityProofFiles: [],
            emergencyContacts: [{ name: "", relationship: undefined, phone: "" }],
            qualifications: [{ degree: "", institution: "", passingYear: "" }],
        },
    })

    // Dynamic Fields
    const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
        control: form.control,
        name: "emergencyContacts",
    })

    const { fields: qualFields, append: appendQual, remove: removeQual } = useFieldArray({
        control: form.control,
        name: "qualifications",
    })

    // State & City Logic
    const selectedState = form.watch("state");
    // Derive available cities directly from selected state
    const availableCities = selectedState ? CITIES[selectedState] || [] : [];

    // Marital Logic
    const maritalStatus = form.watch("maritalStatus");

    // Generator Logic
    const generateEmployeeId = () => {
        const dept = form.getValues("department");
        if (!dept) {
            setEmployeeIdError("Please select a department first");
            return;
        }
        setEmployeeIdError("");

        const deptCodeMap: Record<string, string> = {
            "engineering": "ENG",
            "design": "DES",
            "marketing": "MKT",
            "hr": "HR",
        };

        const code = deptCodeMap[dept] || "GEN";
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const newId = `EMP-${code}-${year}-${rand}`;

        form.setValue("employeeId", newId);
        setIsEmployeeIdGenerated(true);
    };

    // Helper function to get first error field for a row
    const getFirstErrorField = (errors: any, fields: string[]) => {
        if (!errors) return null;
        for (const field of fields) {
            if (errors[field]) return field;
        }
        return null;
    };

    // Helper function to get first error in array fields
    const getFirstArrayError = (errors: any, arrayName: string, fields: string[]) => {
        if (!errors || !errors[arrayName]) return null;
        for (let i = 0; i < errors[arrayName].length; i++) {
            const rowErrors = errors[arrayName][i];
            if (rowErrors) {
                for (const field of fields) {
                    if (rowErrors[field]) {
                        return { index: i, field };
                    }
                }
            }
        }
        return null;
    };

    // Check if emergency contacts have any errors
    const hasContactErrors = () => {
        return !!form.formState.errors.emergencyContacts;
    };

    // Check if qualifications have any errors
    const hasQualificationErrors = () => {
        return !!form.formState.errors.qualifications;
    };

    const isLastContactFilled = () => {
        const contacts = form.watch("emergencyContacts");
        if (contacts.length === 0) return false;
        const last = contacts[contacts.length - 1];
        return last.name.trim() && last.relationship && last.phone.trim();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
        return allowedTypes.some(type => {
            if (type.includes("*")) {
                const [category] = type.split("/");
                return file.type.startsWith(category);
            }
            return file.type === type;
        });
    };

    const handleBankDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

            if (file.size > maxSize) {
                alert("File size should not exceed 5MB");
                return;
            }
            if (!isValidFileType(file, allowedTypes)) {
                alert("Only PDF, JPG, and PNG files are allowed");
                return;
            }
            setBankDocFile(file);
            form.setValue("bankDoc", file);
        }
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

            if (file.size > maxSize) {
                alert("File size should not exceed 5MB");
                return;
            }
            if (!isValidFileType(file, allowedTypes)) {
                alert("Only PDF, DOC and DOCX files are allowed");
                return;
            }
            setResumeFile(file);
            form.setValue("resume", file);
            form.clearErrors("resume");
        }
    };

    const handleIdentityFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const maxSize = 5 * 1024 * 1024;
            const allowedTypes = ["application/pdf"];

            const validFiles = files.filter(file => {
                if (file.size > maxSize) {
                    alert(`${file.name} exceeds 5MB`);
                    return false;
                }
                if (!isValidFileType(file, allowedTypes)) {
                    alert(`${file.name} has unsupported format. Only PDF is allowed.`);
                    return false;
                }
                return true;
            });

            const newFiles = [...identityFiles, ...validFiles];
            setIdentityFiles(newFiles);
            form.setValue("identityProofFiles", newFiles);
            if (newFiles.length > 0) form.clearErrors("identityProofFiles");
        }
    };

    const removeBankDoc = () => {
        setBankDocFile(null);
        form.setValue("bankDoc", undefined);
    };

    const removeResume = () => {
        setResumeFile(null);
        form.setValue("resume", undefined);
    };

    const removeIdentityFile = (index: number) => {
        const updated = identityFiles.filter((_, i) => i !== index);
        setIdentityFiles(updated);
        form.setValue("identityProofFiles", updated);
        // Trigger validation if empty to show error since it's now mandatory
        if (updated.length === 0) {
            form.trigger("identityProofFiles");
        }
    };

    function onSubmit(data: EmployeeFormValues) {
        console.log(data)
        setSubmittedData(data);
        setSubmitDialogOpen(true);
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">New Employee Onboarding</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Complete the form below to register a new hire. Ensure all required documents are ready for upload.
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Save className="w-4 h-4" /> Save Draft
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section 1: Personal Information */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">1</div>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "dd/MM/yyyy", { locale: enIN })
                                                            ) : (
                                                                <span>dd/mm/yyyy</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => {
                                                            const today = new Date();
                                                            const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                                                            return date > eighteenYearsAgo || date < new Date("1900-01-01");
                                                        }}
                                                        captionLayout="dropdown"
                                                        fromYear={1900}
                                                        toYear={new Date().getFullYear() - 18}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Gender</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-6"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="male" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Male</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="female" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Female</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="other" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Other</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="maritalStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Marital Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="numberOfDependents"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Dependents</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter number" type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bloodGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blood Group <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Group" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {BLOOD_GROUPS.map((bg) => (
                                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                                            <Popover open={stateSearchOpen} onOpenChange={setStateSearchOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value || "Choose State"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search state..." />
                                                        <CommandList>
                                                            <CommandEmpty>No state found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {STATES.map((state) => (
                                                                    <CommandItem
                                                                        key={state}
                                                                        value={state}
                                                                        onSelect={() => {
                                                                            field.onChange(state);
                                                                            form.setValue("city", "");
                                                                            setStateSearchOpen(false);
                                                                        }}
                                                                    >
                                                                        {state}
                                                                        <Check
                                                                            className={`ml-auto h-4 w-4 ${field.value === state ? "opacity-100" : "opacity-0"
                                                                                }`}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>District <span className="text-red-500">*</span></FormLabel>
                                            <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                                            disabled={availableCities.length === 0}
                                                        >
                                                            {field.value || "Choose District"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search district..." />
                                                        <CommandList>
                                                            <CommandEmpty>No district found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {availableCities.map((city) => (
                                                                    <CommandItem
                                                                        key={city}
                                                                        value={city}
                                                                        onSelect={() => {
                                                                            field.onChange(city);
                                                                            setCitySearchOpen(false);
                                                                        }}
                                                                    >
                                                                        {city}
                                                                        <Check
                                                                            className={`ml-auto h-4 w-4 ${field.value === city ? "opacity-100" : "opacity-0"
                                                                                }`}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                                            <div className="relative flex items-center">
                                                <div className="absolute left-3 flex items-center pointer-events-none z-10">
                                                    <span className="text-sm font-medium text-gray-500 mr-2">+91</span>
                                                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="XXXXX XXXXX"
                                                        className="pl-14"
                                                        inputMode="numeric"
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const formatted = formatPhoneNumber(e.target.value);
                                                            field.onChange(formatted);
                                                            form.trigger("phone");
                                                        }}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="johndoe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Residential Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter full permanent address" className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Emergency Contacts</h3>
                                {contactFields.map((field, index) => (
                                    <div key={field.id} className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start ${form.formState.errors.emergencyContacts?.[index] ? 'border border-red-300 rounded-lg p-3 bg-red-50 dark:bg-red-950/20' : ''}`}>
                                        <FormField
                                            control={form.control}
                                            name={`emergencyContacts.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Contact Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Full name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`emergencyContacts.${index}.relationship`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Relationship <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select Relationship" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {RELATIONSHIPS.map((rel) => (
                                                                <SelectItem key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`emergencyContacts.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Phone <span className="text-red-500">*</span></FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <div className="relative flex items-center flex-1">
                                                                <div className="absolute left-3 flex items-center pointer-events-none z-10">
                                                                    <span className="text-sm font-medium text-gray-500 mr-2">+91</span>
                                                                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
                                                                </div>
                                                                <Input
                                                                    placeholder="XXXXX XXXXX"
                                                                    className="pl-14"
                                                                    inputMode="numeric"
                                                                    value={field.value}
                                                                    onChange={(e) => {
                                                                        const formatted = formatPhoneNumber(e.target.value);
                                                                        field.onChange(formatted);
                                                                        form.trigger(`emergencyContacts.${index}.phone`);
                                                                    }}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 shrink-0"
                                                            disabled={contactFields.length === 1 && index === 0}
                                                            onClick={() => {
                                                                form.clearErrors(`emergencyContacts.${index}.name`);
                                                                form.clearErrors(`emergencyContacts.${index}.relationship`);
                                                                form.clearErrors(`emergencyContacts.${index}.phone`);
                                                                setContactToDelete(index);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                                {contactFields.length < 2 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0 mt-2"
                                        onClick={() => {
                                            appendContact({ name: "", relationship: "", phone: "" });
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Another Contact
                                    </Button>
                                )}

                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Deletion</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this emergency contact? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    if (contactToDelete !== null) {
                                                        form.clearErrors(`emergencyContacts.${contactToDelete}.name`);
                                                        form.clearErrors(`emergencyContacts.${contactToDelete}.relationship`);
                                                        form.clearErrors(`emergencyContacts.${contactToDelete}.phone`);
                                                        removeContact(contactToDelete);
                                                    }
                                                    setDeleteDialogOpen(false);
                                                    setContactToDelete(null);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Employment Details */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">2</div>
                                <CardTitle className="text-lg">Employment Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="jobTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Job Title" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {JOB_TITLES.map((title) => (
                                                        <SelectItem key={title} value={title.toLowerCase().replace(/\s+/g, '-')}>
                                                            {title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="engineering">Engineering</SelectItem>
                                                    <SelectItem value="design">Design</SelectItem>
                                                    <SelectItem value="marketing">Marketing</SelectItem>
                                                    <SelectItem value="hr">Human Resources</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="employeeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee ID</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. EMP-0042"
                                                        {...field}
                                                        readOnly
                                                        onCopy={(e) => e.preventDefault()}
                                                        onPaste={(e) => e.preventDefault()}
                                                        onCut={(e) => e.preventDefault()}
                                                        onContextMenu={(e) => e.preventDefault()}
                                                        className="cursor-not-allowed bg-muted"
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={generateEmployeeId}
                                                    disabled={isEmployeeIdGenerated}
                                                >
                                                    <Fingerprint className="w-4 h-4 mr-2 text-blue-600" /> Generate
                                                </Button>
                                            </div>
                                            <FormMessage />
                                            {employeeIdError && (
                                                <p className="text-sm font-medium text-destructive mt-1">{employeeIdError}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reportingManager"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Reporting Manager</FormLabel>
                                            <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className={`text-xs ${MANAGERS.find(m => m.name === field.value)?.color}`}>
                                                                            {MANAGERS.find(m => m.name === field.value)?.initials}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    {field.value}
                                                                </div>
                                                            ) : (
                                                                "Choose Reporting Manager"
                                                            )}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search manager..." />
                                                        <CommandList>
                                                            <CommandEmpty>No manager found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {MANAGERS.map((manager) => (
                                                                    <CommandItem
                                                                        key={manager.name}
                                                                        value={manager.name}
                                                                        onSelect={() => {
                                                                            field.onChange(manager.name)
                                                                            setManagerSearchOpen(false)
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarFallback className={`text-xs ${manager.color} text-white`}>
                                                                                    {manager.initials}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            {manager.name}
                                                                        </div>
                                                                        <Check
                                                                            className={`ml-auto h-4 w-4 ${field.value === manager.name ? "opacity-100" : "opacity-0"
                                                                                }`}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="hireDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">

                                            <FormLabel>Joining Date <span className="text-red-500">*</span></FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "dd/MM/yyyy", { locale: enIN })
                                                            ) : (
                                                                <span>dd/mm/yyyy</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > today}
                                                        captionLayout="dropdown"
                                                        fromYear={1950}
                                                        toYear={new Date().getFullYear()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="annualCompensation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Annual Compensation</FormLabel>
                                            <div className="relative flex items-center">
                                                <IndianRupee className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none z-10" />
                                                <FormControl>
                                                    <Input placeholder="0.00" className="pl-9" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Banking Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Bank" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {BANKS.map((bank) => (
                                                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="panCardNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PAN Card Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. ABCDE1234F" className="uppercase" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bankAccountName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name as per Bank Records</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Account Holder Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bankAccount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Account Number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="ifscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IFSC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="IFSC" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="branchName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Branch Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Branch" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="micrCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>MICR Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="MICR" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Bank Doc Upload */}
                                <div className="mt-6">
                                    <FormField
                                        control={form.control}
                                        name="bankDoc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cancelled Cheque / Passbook</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        {!bankDocFile ? (
                                                            <label className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                                                                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload bank proof</span>
                                                                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                                                                <Input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                                    onChange={handleBankDocUpload}
                                                                    ref={field.ref}
                                                                />
                                                            </label>
                                                        ) : (
                                                            <div className="border-2 border-gray-200 dark:border-zinc-800 rounded-lg p-4 bg-gray-50 dark:bg-zinc-900">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                                            <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{bankDocFile.name}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(bankDocFile.size)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                                                                        onClick={removeBankDoc}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Section 3: Qualifications & Compliance */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">3</div>
                                <CardTitle className="text-lg">Qualifications & Compliance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-sm font-medium mb-4">Educational Qualifications</h3>
                            {qualFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`qualifications.${index}.degree`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Degree <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Degree" {...field} onKeyPress={(e) => { if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`qualifications.${index}.institution`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Institution <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Institution" {...field} onKeyPress={(e) => { if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`qualifications.${index}.passingYear`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Year of Completion <span className="text-red-500">*</span></FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="YYYY" inputMode="numeric" value={field.value} onChange={(e) => { const formatted = formatYear(e.target.value); field.onChange(formatted); form.trigger(`qualifications.${index}.passingYear`); }} onKeyPress={(e) => { if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); }} />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 shrink-0"
                                                        onClick={() => {
                                                            form.clearErrors(`qualifications.${index}.degree`);
                                                            form.clearErrors(`qualifications.${index}.institution`);
                                                            form.clearErrors(`qualifications.${index}.passingYear`);
                                                            setQualToDelete(index);
                                                            setQualDeleteDialogOpen(true);
                                                        }}
                                                        disabled={qualFields.length === 1 && index === 0}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}


                            {qualFields.length < 3 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0"
                                    onClick={() => appendQual({ degree: "", institution: "", passingYear: "" })}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Another Qualification
                                </Button>
                            )}

                            <Dialog open={qualDeleteDialogOpen} onOpenChange={setQualDeleteDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete this qualification? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setQualDeleteDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (qualToDelete !== null) {
                                                    removeQual(qualToDelete);
                                                }
                                                setQualDeleteDialogOpen(false);
                                                setQualToDelete(null);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Separator className="my-8" />

                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Document Uploads</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
                                {/* Column 1: Profile Picture */}
                                <FormField
                                    control={form.control}
                                    name="profilePicture"
                                    render={({ field: { onChange, ...fieldProps } }) => (
                                        <FormItem className="flex flex-col h-full">
                                            <FormControl>
                                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors relative aspect-square w-full">
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                        <h4 className="font-medium text-sm mb-4 text-gray-900 dark:text-white">Profile Picture <span className="text-red-500">*</span></h4>
                                                        <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors overflow-hidden mb-4">
                                                            {previewUrl ? (
                                                                <img
                                                                    src={previewUrl}
                                                                    alt="Profile Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                                                                    <User className="w-6 h-6 mb-1" />
                                                                    <span className="text-[10px] font-medium">Upload</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">JPG, PNG, JPEG (Max 2MB)</p>
                                                        <Input
                                                            {...fieldProps}
                                                            value={undefined}
                                                            type="file"
                                                            accept="image/png, image/jpeg, image/jpg"
                                                            className="hidden"
                                                            onChange={(event) => {
                                                                const file = event.target.files && event.target.files[0];
                                                                if (file) {
                                                                    if (file.size > 2 * 1024 * 1024) {
                                                                        alert("File size should not exceed 2MB");
                                                                        return;
                                                                    }
                                                                    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
                                                                        alert("Only JPG, JPEG, and PNG files are allowed");
                                                                        return;
                                                                    }
                                                                    form.setValue("profilePicture", file);
                                                                    const url = URL.createObjectURL(file);
                                                                    setPreviewUrl(url);
                                                                    form.trigger("profilePicture");
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="mt-2" />
                                        </FormItem>
                                    )}
                                />

                                {/* Column 2: Resume Upload */}
                                <FormField
                                    control={form.control}
                                    name="resume"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col h-full">
                                            <FormControl>
                                                {!resumeFile ? (
                                                    <label className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative aspect-square w-full">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                                            <UploadCloud className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">Upload Resume/CV</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                                        <Input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleResumeUpload}
                                                            ref={field.ref}
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="border-2 border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-900 aspect-square w-full flex flex-col justify-center">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                                                    <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{resumeFile.name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(resumeFile.size)}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 shrink-0"
                                                                onClick={removeResume}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </FormControl>
                                            <FormMessage className="mt-2" />
                                        </FormItem>
                                    )}
                                />

                                {/* Column 3: Identity Proofs */}
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col aspect-square w-full">
                                    <FormField
                                        control={form.control}
                                        name="identityProofTypes"
                                        render={({ field }) => (
                                            <FormItem className="mb-6">
                                                <FormLabel className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-3">Identity Proofs <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        options={IDENTITY_PROOFS.map(id => ({ label: id, value: id }))}
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        placeholder="Select IDs"
                                                        variant="inverted"
                                                        maxCount={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator className="my-4" />

                                    <FormField
                                        control={form.control}
                                        name="identityProofFiles"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 flex flex-col">
                                                <FormLabel className={identityFiles.length === 0 ? "sr-only" : "sr-only"}>Identity Proof Files <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-col gap-3 flex-1">
                                                        {identityFiles.length < 3 && (
                                                            <label className={`border-2 border-dashed ${form.formState.errors.identityProofFiles ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-gray-300 dark:border-gray-700"} rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative flex-1`}>
                                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                                                                    <UploadCloud className="w-4 h-4" />
                                                                </div>
                                                                <h4 className="font-medium text-xs text-gray-900 dark:text-white">Upload Files <span className="text-red-500">*</span></h4>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">PDF Only (Max 5MB each)</p>
                                                                <Input
                                                                    type="file"
                                                                    multiple
                                                                    className="hidden"
                                                                    accept=".pdf"
                                                                    onChange={handleIdentityFilesUpload}
                                                                />
                                                            </label>
                                                        )}

                                                        {identityFiles.length > 0 && (
                                                            <div className="space-y-2 flex-1">
                                                                {identityFiles.map((file, index) => (
                                                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
                                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                                                                <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 shrink-0 h-8 w-8"
                                                                            onClick={() => removeIdentityFile(index)}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 py-8">
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Onboarding
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Submit Confirmation Dialog */}
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <DialogTitle className="text-xl font-bold font-sans">Data Verification Audit</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Review all submitted employee data for accuracy and compliance.
                                </DialogDescription>
                            </div>
                            {previewUrl && (
                                <div className="shrink-0 border-2 border-white dark:border-zinc-800 shadow-sm rounded-lg overflow-hidden w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-zinc-800">
                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                    {submittedData && (
                        <div className="space-y-8 py-4">
                            {/* Personal Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Personal Information</h3>
                                </div>
                                <div className="space-y-4 pl-6 border-l-2 border-gray-100 dark:border-zinc-800 ml-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="col-span-1">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.firstName} {submittedData.lastName}</p>
                                        </div>
                                        {submittedData.dob && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Date of Birth</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{format(submittedData.dob, "MMM dd, yyyy", { locale: enIN })}</p>
                                            </div>
                                        )}
                                        {submittedData.gender && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Gender</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{submittedData.gender}</p>
                                            </div>
                                        )}
                                        {submittedData.maritalStatus && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Marital Status</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{submittedData.maritalStatus}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {submittedData.state && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">State</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.state}</p>
                                            </div>
                                        )}
                                        {submittedData.email && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Email</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium truncate" title={submittedData.email}>{submittedData.email}</p>
                                            </div>
                                        )}
                                        {submittedData.phone && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Phone</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">+91 {submittedData.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {submittedData.address && (
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Residential Address</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1" title={submittedData.address}>{submittedData.address}</p>
                                            </div>
                                        )}
                                        {submittedData.emergencyContacts?.[0] && (
                                            <>
                                                <div className="col-span-1">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Emergency Contact</p>
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.emergencyContacts[0].name}</p>
                                                    <p className="text-[10px] text-gray-500">{submittedData.emergencyContacts[0].relationship}</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Emergency Phone</p>
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">+91 {submittedData.emergencyContacts[0].phone}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Employment Details</h3>
                                </div>
                                <div className="space-y-4 pl-6 border-l-2 border-gray-100 dark:border-zinc-800 ml-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {submittedData.jobTitle && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Job Title</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{submittedData.jobTitle.replace(/-/g, ' ')}</p>
                                            </div>
                                        )}
                                        {submittedData.department && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Department</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{submittedData.department}</p>
                                            </div>
                                        )}
                                        {submittedData.employeeId && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Employee ID</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.employeeId}</p>
                                            </div>
                                        )}
                                        {submittedData.reportingManager && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Manager</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.reportingManager}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {submittedData.hireDate && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Hire Date</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{format(submittedData.hireDate, "MMM dd, yyyy", { locale: enIN })}</p>
                                            </div>
                                        )}
                                        {submittedData.annualCompensation && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Compensation</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">₹{submittedData.annualCompensation}/yr</p>
                                            </div>
                                        )}
                                        {submittedData.bankName && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Bank Name</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{submittedData.bankName}</p>
                                            </div>
                                        )}
                                        {submittedData.panCardNumber && (
                                            <div className="col-span-1">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">PAN Number</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium uppercase">{submittedData.panCardNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Qualifications & Compliance boxes */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Qualifications & Compliance</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                    <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-3">Education History</p>
                                        {submittedData.qualifications.length > 0 ? submittedData.qualifications.map((qual, index) => (
                                            <div key={index} className="flex items-start gap-2 mb-3 last:mb-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">{qual.degree}</p>
                                                    <p className="text-[10px] text-gray-500 text-xs">Institution: {qual.institution}, Year: {qual.passingYear}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-xs text-gray-500">No qualifications added</p>}
                                    </div>

                                    <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-3">Attached Documents</p>
                                        <div className="space-y-2">
                                            {submittedData.resume && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Resume_{submittedData.firstName}.pdf</p>
                                                </div>
                                            )}
                                            {submittedData.identityProofTypes.map((proof, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{proof.replace(/ /g, '_')}.pdf</p>
                                                </div>
                                            ))}
                                            {submittedData.bankDoc && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Bank_Document.pdf</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <Button variant="outline" className="h-9" onClick={() => setRevisionDialogOpen(true)}>
                            Request Revisions
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white h-9" onClick={() => setSubmitDialogOpen(false)}>
                            <Check className="w-4 h-4 mr-2" />
                            Verify & Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revision Confirmation Dialog */}
            <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Revisions</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to request revisions? This will return the application to the candidate.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRevisionDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            setRevisionDialogOpen(false);
                            setSubmitDialogOpen(false);
                        }}>Request Revisions</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
