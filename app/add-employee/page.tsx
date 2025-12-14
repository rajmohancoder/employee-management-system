"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, UploadCloud, Save, Plus, Trash2, RefreshCw, IndianRupee, User } from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

const MANAGERS = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Neha Gupta", "Vikram Singh"] as const;

const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

    if (cleaned.length === 0) return "";
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

// --- Schema ---
const employeeFormSchema = z.object({
    firstName: z.string().min(1, "Please enter your first name").min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Please enter your last name").min(2, "Last name must be at least 2 characters"),
    profilePicture: z.any()
        .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max file size is 2MB")
        .refine(
            (file) => !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
            "Only .jpg, .jpeg, .png formats are supported"
        ).optional(),
    dob: z.date({ message: "Please select your date of birth" }),
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
        name: z.string().min(1, "Please enter contact's name"),
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

    identityProofTypes: z.array(z.string()).min(1, "Please select at least one ID proof type"),
    identityProofFiles: z.array(z.any()).optional(),

    qualifications: z.array(z.object({
        degree: z.string().min(1, "Please enter degree name"),
        institution: z.string().min(1, "Please enter institution name"),
        passingYear: z.string().min(1, "Please enter passing year"),
    })).max(3, "Maximum 3 qualifications allowed"),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export default function AddEmployeePage() {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            identityProofTypes: [],
            identityProofFiles: [],
            emergencyContacts: [{ name: "", relationship: "", phone: "" }],
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
            alert("Please select a department first.");
            return;
        }

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
    };

    function onSubmit(data: EmployeeFormValues) {
        console.log(data)
        alert("Form submitted! Check console for data.")
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
                                                                format(field.value, "dd/MM/yyyy")
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
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                        captionLayout="dropdown"
                                                        fromYear={1900}
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
                                        <FormItem>
                                            <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue("city", "");
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Choose State" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STATES.map((state) => (
                                                        <SelectItem key={state} value={state}>{state}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                key={field.value} // Force re-render on value change to ensure placeholder shows
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={availableCities.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Choose City" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableCities.map((city) => (
                                                        <SelectItem key={city} value={city}>{city}</SelectItem>
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
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const formatted = formatPhoneNumber(e.target.value);
                                                            field.onChange(formatted);
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
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`emergencyContacts.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Contact Name</FormLabel>
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
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Relationship</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Spouse" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`emergencyContacts.${index}.phone`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Phone</FormLabel>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1 flex items-center">
                                                                <div className="absolute left-3 flex items-center pointer-events-none z-10">
                                                                    <span className="text-sm font-medium text-gray-500 mr-2">+91</span>
                                                                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
                                                                </div>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="XXXXX XXXXX"
                                                                        className="pl-14"
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            const formatted = formatPhoneNumber(e.target.value);
                                                                            field.onChange(formatted);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-600 shrink-0"
                                                                onClick={() => removeContact(index)}
                                                                disabled={contactFields.length === 1 && index === 0}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0 mt-2"
                                    onClick={() => appendContact({ name: "", relationship: "", phone: "" })}
                                    disabled={contactFields.length >= 2}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Another Contact
                                </Button>
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
                                            <FormControl>
                                                <Input placeholder="e.g. Senior Developer" {...field} />
                                            </FormControl>
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
                                                    <Input placeholder="e.g. EMP-0042" {...field} />
                                                </FormControl>
                                                <Button type="button" variant="outline" onClick={generateEmployeeId}>
                                                    <RefreshCw className="w-4 h-4 mr-2" /> Generate
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reportingManager"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reporting Manager</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Choose Reporting Manager" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {MANAGERS.map((manager) => (
                                                        <SelectItem key={manager} value={manager}>{manager}</SelectItem>
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
                                                                format(field.value, "dd/MM/yyyy")
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
                                                        initialFocus
                                                        captionLayout="dropdown"
                                                        fromYear={1950}
                                                        toYear={new Date().getFullYear() + 1}
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
                                                    <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                                                        <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload bank proof</span>
                                                        <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                                                        <Input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                                                            ref={field.ref}
                                                        />
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
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Degree</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Degree" {...field} />
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
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Institution</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Institution" {...field} />
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
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Year</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="Year" {...field} />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 shrink-0"
                                                        onClick={() => removeQual(index)}
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

                            <Button
                                type="button"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0"
                                onClick={() => appendQual({ degree: "", institution: "", passingYear: "" })}
                                disabled={qualFields.length >= 3}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Another Qualification
                            </Button>

                            <Separator className="my-8" />

                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Document Uploads</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Profile Picture */}
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors relative h-full">
                                    <h4 className="font-medium text-sm mb-4">Profile Picture</h4>
                                    <FormField
                                        control={form.control}
                                        name="profilePicture"
                                        render={({ field: { value, onChange, ...fieldProps } }) => (
                                            <FormItem className="flex flex-col items-center w-full">
                                                <FormControl>
                                                    <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors overflow-hidden group">
                                                        {previewUrl ? (
                                                            <img
                                                                src={previewUrl}
                                                                alt="Profile Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center text-gray-400">
                                                                <User className="w-6 h-6 mb-1" />
                                                                <span className="text-[10px] font-medium">Upload</span>
                                                            </div>
                                                        )}
                                                        <Input
                                                            {...fieldProps}
                                                            type="file"
                                                            accept="image/png, image/jpeg, image/jpg"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            onChange={(event) => {
                                                                const file = event.target.files && event.target.files[0];
                                                                if (file) {
                                                                    onChange(file);
                                                                    const url = URL.createObjectURL(file);
                                                                    setPreviewUrl(url);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-xs text-gray-500 mt-4">JPG, PNG up to 2MB</p>
                                </div>

                                {/* Column 2: Resume Upload */}
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative h-full">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-medium text-sm">Upload Resume/CV</h4>
                                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 5MB</p>
                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>

                                {/* Column 3: Identity Proofs */}
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        control={form.control}
                                        name="identityProofTypes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Identity Proofs</FormLabel>
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

                                    <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative flex-1">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                                            <UploadCloud className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-medium text-xs">Upload Files</h4>
                                        <p className="text-[10px] text-gray-500 mt-0.5">PDF, JPG</p>
                                        <Input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 py-8">
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Submit Onboarding</Button>
                    </div>
                </form>
            </Form>
        </div >
    )
}
