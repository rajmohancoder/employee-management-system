"use client";

import React, { useState } from 'react';
import { MultiSelect } from "@/components/ui/multi-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SearchIcon, PlusCircleIcon, MoreHorizontalIcon, PhoneIcon, MessageCircleIcon, UserIcon, Pencil, Trash2, UserX, ShieldAlert } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parse } from "date-fns"
import { Users as UsersIcon2, UserPlus as UserPlusIcon2 } from 'lucide-react';

export default function DashboardPage() {
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Filter Logic
    // Augment data with status for consistency
    const EMPLOYEES_WITH_STATUS = EMPLOYEES.map((emp, i) => ({
        ...emp,
        status: i % 3 === 0 ? "Inactive" : i % 2 === 0 ? "On Leave" : "Active"
    }));

    const finalFiltered = EMPLOYEES_WITH_STATUS.filter(emp => {
        const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(emp.status);
        const roleMatch = selectedRole.length === 0 || selectedRole.includes(emp.role);

        let dateMatch = true;
        if (dateRange?.from && dateRange?.to) {
            const joinedDate = parse(emp.joined, "M/d/yyyy", new Date());
            dateMatch = isWithinInterval(joinedDate, { start: dateRange.from, end: dateRange.to });
        } else if (dateRange?.from) {
            const joinedDate = parse(emp.joined, "M/d/yyyy", new Date());
            // basic check for single date selection if needed, or treat range logic strictly
            // usually range picker sets 'to' as undefined initially
            dateMatch = joinedDate >= dateRange.from;
        }

        return statusMatch && roleMatch && dateMatch;
    });

    const statusOptions = [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "On Leave", value: "On Leave" },
    ];

    const roleOptions = [
        { label: "Manager", value: "Manager" },
        { label: "Admin", value: "Admin" },
        { label: "Staff", value: "Staff" },
        { label: "Frontend Developer", value: "Frontend Developer" },
        { label: "Backend Developer", value: "Backend Developer" },
        { label: "UI/UX Designer", value: "UI/UX Designer" },
        { label: "Product Manager", value: "Product Manager" },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Employee"
                    value="100"
                    icon={<UsersIcon2 />}
                    bg="bg-purple-50 dark:bg-purple-900/20"
                    iconBg="bg-white dark:bg-purple-900/40"
                    titleColor="text-gray-500 dark:text-purple-200"
                    valueColor="text-gray-800 dark:text-purple-100"
                />
                <StatsCard
                    title="New Employee"
                    value="15"
                    icon={<UserPlusIcon2 />}
                    bg="bg-orange-50 dark:bg-orange-900/20"
                    iconBg="bg-white dark:bg-orange-900/40"
                    titleColor="text-gray-500 dark:text-orange-200"
                    valueColor="text-gray-800 dark:text-orange-100"
                />
                <StatsCard
                    title="Male"
                    value="65"
                    icon={<MaleIcon />}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                    iconBg="bg-white dark:bg-blue-900/40"
                    titleColor="text-gray-500 dark:text-blue-200"
                    valueColor="text-gray-800 dark:text-blue-100"
                />
                <StatsCard
                    title="Female"
                    value="20"
                    icon={<FemaleIcon />}
                    bg="bg-green-50 dark:bg-green-900/20"
                    iconBg="bg-white dark:bg-green-900/40"
                    titleColor="text-gray-500 dark:text-green-200"
                    valueColor="text-gray-800 dark:text-green-100"
                />
            </div>

            {/* Filter and Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row flex-1 gap-4 w-full items-center">
                    {/* Styled Input */}
                    <div className="relative w-full md:w-auto md:flex-1 min-w-[200px] group">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 w-4 h-4 transition-colors" />
                        <input
                            type="text"
                            placeholder="Employee Name"
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-500 dark:focus:border-gray-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-zinc-700"
                        />
                    </div>

                    {/* shadcn MultiSelect for Status */}
                    <div className="relative w-full md:w-auto md:flex-1 min-w-[200px]">
                        <MultiSelect
                            options={statusOptions}
                            onValueChange={setSelectedStatus}
                            defaultValue={selectedStatus}
                            placeholder="Select Status"
                            variant="default" // or "secondary", "inverted"
                            className="bg-white dark:bg-zinc-900"
                        />
                    </div>

                    {/* shadcn MultiSelect for Role */}
                    <div className="relative w-full md:w-auto md:flex-1 min-w-[200px]">
                        <MultiSelect
                            options={roleOptions}
                            onValueChange={setSelectedRole}
                            defaultValue={selectedRole}
                            placeholder="Select Role"
                            variant="default"
                            className="bg-white dark:bg-zinc-900"
                        />
                    </div>

                    {/* Date Range Picker */}
                    <div className="relative w-full md:w-auto md:flex-1 min-w-[260px]">
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={setDateRange}
                        />
                    </div>

                    <button className="bg-gray-900 dark:bg-zinc-800 text-white p-2 rounded-lg hover:bg-black dark:hover:bg-zinc-700 transition-colors shadow-md flex-shrink-0 w-full md:w-auto flex justify-center">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all font-medium shadow-sm active:scale-95">
                    <PlusCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Employee List Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Employee List</h2>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                        {EMPLOYEES.length}
                    </Badge>
                </div>

                <div className="flex items-center gap-4">
                    {/* Select Export MultiSelect */}
                    <div className="min-w-[150px]">
                        <MultiSelect
                            options={[
                                { label: "CSV", value: "CSV" },
                                { label: "Excel", value: "Excel" },
                                { label: "PDF", value: "PDF" },
                                { label: "Print", value: "Print" },
                            ]}
                            onValueChange={() => { }} // No-op for now as logic wasn't requested
                            defaultValue={[]}
                            placeholder="Select Export"
                            variant="default"
                            maxCount={2}
                        />
                    </div>

                    {/* Show Entries */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">Show Entries</span>
                        <Select defaultValue="10">
                            <SelectTrigger className="w-[80px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Employee List - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {finalFiltered.length > 0 ? (
                    finalFiltered.map((emp, index) => (
                        <EmployeeCard key={index} employee={emp} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                        No employees found matching the filters.
                    </div>
                )}
            </div>
        </div>
    );
}

// Data
const EMPLOYEES = [
    // ... existing data (unchanged) ...
    {
        name: "Ruben Korsgaard",
        role: "Frontend Developer",
        id: "FD-1467",
        joined: "2/4/2023",
        image: "https://i.pravatar.cc/150?u=1",
        bloodGroup: "A+",
        location: "New York, NY",
        dateOfBirth: "12/05/1990",
        maritalStatus: "Single",
    },
    {
        name: "Gustav Larsen",
        role: "Backend Developer",
        id: "BD-1234",
        joined: "5/8/2023",
        image: "https://i.pravatar.cc/150?u=2",
        bloodGroup: "O-",
        location: "London, UK",
        dateOfBirth: "08/15/1988",
        maritalStatus: "Married",
    },
    {
        name: "Maria Garcia",
        role: "UI/UX Designer",
        id: "UI-9876",
        joined: "12/1/2023",
        image: "https://i.pravatar.cc/150?u=3",
        bloodGroup: "B+",
        location: "Madrid, Spain",
        dateOfBirth: "03/22/1995",
        maritalStatus: "Single",
    },
    {
        name: "James Smith",
        role: "Product Manager",
        id: "PM-5555",
        joined: "3/3/2023",
        image: "https://i.pravatar.cc/150?u=4",
        bloodGroup: "O+",
        location: "Chicago, IL",
        dateOfBirth: "11/30/1985",
        maritalStatus: "Married",
    },
    {
        name: "Olivia Jones",
        role: "Admin",
        id: "AD-1111",
        joined: "1/10/2023",
        image: "https://i.pravatar.cc/150?u=5",
        bloodGroup: "AB+",
        location: "Sydney, AU",
        dateOfBirth: "05/12/1992",
        maritalStatus: "Single",
    },
    {
        name: "Liam Brown",
        role: "Staff",
        id: "ST-2222",
        joined: "6/15/2023",
        image: "https://i.pravatar.cc/150?u=6",
        bloodGroup: "O+",
        location: "Toronto, CA",
        dateOfBirth: "09/01/1996",
        maritalStatus: "Single",
    },
    {
        name: "Emma Wilson",
        role: "Manager",
        id: "MG-3333",
        joined: "9/20/2022",
        image: "https://i.pravatar.cc/150?u=7",
        bloodGroup: "A-",
        location: "Berlin, DE",
        dateOfBirth: "02/14/1985",
        maritalStatus: "Married",
    },
    {
        name: "Noah Davis",
        role: "Frontend Developer",
        id: "FD-4444",
        joined: "11/05/2023",
        image: "https://i.pravatar.cc/150?u=8",
        bloodGroup: "B-",
        location: "Paris, FR",
        dateOfBirth: "07/07/1994",
        maritalStatus: "Single",
    },
    {
        name: "Ava Miller",
        role: "UI/UX Designer",
        id: "UI-5555",
        joined: "4/01/2023",
        image: "https://i.pravatar.cc/150?u=9",
        bloodGroup: "O+",
        location: "Tokyo, JP",
        dateOfBirth: "10/30/1998",
        maritalStatus: "Single",
    },
    {
        name: "Lucas Taylor",
        role: "Backend Developer",
        id: "BD-6666",
        joined: "8/12/2023",
        image: "https://i.pravatar.cc/150?u=10",
        bloodGroup: "AB-",
        location: "Mumbai, IN",
        dateOfBirth: "01/25/1991",
        maritalStatus: "Married",
    },
    {
        name: "Sophia Anderson",
        role: "Product Manager",
        id: "PM-7777",
        joined: "2/28/2023",
        image: "https://i.pravatar.cc/150?u=11",
        bloodGroup: "A+",
        location: "Dubai, UAE",
        dateOfBirth: "06/18/1989",
        maritalStatus: "Married",
    },
    {
        name: "Mason Thomas",
        role: "Admin",
        id: "AD-8888",
        joined: "7/07/2023",
        image: "https://i.pravatar.cc/150?u=12",
        bloodGroup: "B+",
        location: "Singapore, SG",
        dateOfBirth: "12/03/1993",
        maritalStatus: "Single",
    },
];

// Components
function StatsCard({ title, value, icon, bg, iconBg, titleColor, valueColor }: { title: string, value: string, icon: React.ReactNode, bg: string, iconBg: string, titleColor?: string, valueColor?: string }) {
    return (
        <div className={`${bg} p-6 rounded-2xl flex items-center gap-4 transition-colors duration-300`}>
            <div className={`${iconBg} p-3 rounded-xl flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className={`${titleColor || 'text-gray-500'} text-sm font-medium`}>{title}</p>
                <p className={`${valueColor || 'text-gray-800'} text-2xl font-bold`}>{value}</p>
            </div>
        </div>
    )
}

interface Employee {
    name: string;
    role: string;
    id: string;
    joined: string;
    image: string;
    status?: string;
    bloodGroup?: string;
    location?: string;
    dateOfBirth?: string;
    maritalStatus?: string;
}

function EmployeeCard({ employee }: { employee: Employee }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center relative hover:shadow-lg dark:hover:shadow-zinc-900/10 transition-all duration-300 group">
            <div className="absolute top-4 right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 outline-none">
                            <MoreHorizontalIcon className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400">
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Terminate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-yellow-600 focus:text-yellow-600 dark:text-yellow-400 dark:focus:text-yellow-400">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Restricted</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-4 border-gray-50 dark:border-zinc-800">
                <img src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
            </div>

            <h3 className="font-bold text-gray-800 dark:text-gray-100">{employee.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full mt-1 mb-4">{employee.role}</p>

            <div className="w-full space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Employee id</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Join Date</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.joined}</span>
                </div>
                {employee.bloodGroup && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500">Blood Group</span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.bloodGroup}</span>
                    </div>
                )}
                {employee.location && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500">Location</span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.location}</span>
                    </div>
                )}
                {employee.dateOfBirth && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500">Date of Birth</span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.dateOfBirth}</span>
                    </div>
                )}
                {employee.maritalStatus && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500">Marital Status</span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{employee.maritalStatus}</span>
                    </div>
                )}
            </div>
            {employee.status && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mt-4 ${employee.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                    employee.status === 'Inactive' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                    {employee.status}
                </span>
            )}
        </div>
    )
}

function ActionButton({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-400 border border-gray-200 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}>
            {icon}
        </button>
    )
}
// Icons ... (rest of the file)
// Icons
function UsersIcon2(props: React.SVGProps<SVGSVGElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/total-employees-new.png" alt="Total Employees" className="w-10 h-10 object-contain" {...props as any} />
}
function UserPlusIcon2(props: React.SVGProps<SVGSVGElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/new-employee.png" alt="New Employee" className="w-10 h-10 object-contain" {...props as any} />
}
function MaleIcon(props: React.SVGProps<SVGSVGElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/male-employee.png" alt="Male Employee" className="w-10 h-10 object-contain" {...props as any} />
}
function FemaleIcon(props: React.SVGProps<SVGSVGElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/female-employee.png" alt="Female Employee" className="w-10 h-10 object-contain" {...props as any} />
}
function UserIcon3(props: React.SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
}
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>
}
