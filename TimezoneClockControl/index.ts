import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as moment from "moment-timezone";
import "./style.css"; // Import custom styles

export class TimezoneConverterControl
    implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
    private container: HTMLDivElement;
    private datetimeInput: HTMLInputElement;
    private cityDropdown: HTMLSelectElement;
    private clockCanvas: HTMLCanvasElement;
    private selectedTimezone: string;
    private clockInterval: number | undefined;

    private timezoneData = [
        { city: "New York", timezone: "America/New_York" },
        { city: "London", timezone: "Europe/London" },
        { city: "Tokyo", timezone: "Asia/Tokyo" },
        { city: "Mumbai", timezone: "Asia/Kolkata" },
        { city: "Lahore", timezone: "Asia/Karachi" },
        { city: "Karachi", timezone: "Asia/Karachi" },
       
    ];

    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;

        // Create the wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "timezone-converter";

        // Add header
        const header = document.createElement("div");
        header.className = "timezone-converter-header";
        header.textContent = "Timezone Converter";
        wrapper.appendChild(header);

        // Datetime picker
        const dateLabel = document.createElement("label");
        dateLabel.textContent = "Select Local Datetime:";
        this.datetimeInput = document.createElement("input");
        this.datetimeInput.type = "datetime-local";
        this.datetimeInput.className = "datetime-input";
        wrapper.appendChild(dateLabel);
        wrapper.appendChild(this.datetimeInput);

        // City dropdown
        const cityLabel = document.createElement("label");
        cityLabel.textContent = "Select City:";
        this.cityDropdown = document.createElement("select");
        this.cityDropdown.className = "city-dropdown";
        this.timezoneData.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.timezone;
            option.textContent = item.city;
            this.cityDropdown.appendChild(option);
        });
        wrapper.appendChild(cityLabel);
        wrapper.appendChild(this.cityDropdown);

        // Analog clock
        this.clockCanvas = document.createElement("canvas");
        this.clockCanvas.width = 200;
        this.clockCanvas.height = 200;
        this.clockCanvas.className = "analog-clock";
        wrapper.appendChild(this.clockCanvas);

        // Append wrapper to the container
        this.container.appendChild(wrapper);

        // Set default timezone to the first option
        this.selectedTimezone = this.timezoneData[0].timezone;

        // Add event listeners
        this.datetimeInput.addEventListener("change", this.updateClock.bind(this));
        this.cityDropdown.addEventListener("change", this.onCityChange.bind(this));

        // Start clock updates
        this.startClock();
    }

    private onCityChange(): void {
        // Update the selected timezone based on dropdown selection
        this.selectedTimezone = this.cityDropdown.value;
        this.updateClock();
    }

    private updateClock(): void {
        if (!this.clockInterval) {
            // Clear any existing intervals
            clearInterval(this.clockInterval);
        }
        this.renderClock(moment().tz(this.selectedTimezone));
    }

    private startClock(): void {
        // Set the interval to update the clock every second
        this.clockInterval = window.setInterval(() => {
            this.renderClock(moment().tz(this.selectedTimezone));
        }, 1000);
    }

    private renderClock(time: moment.Moment): void {
        const ctx = this.clockCanvas.getContext("2d");
        if (!ctx) return;

        const hours = time.hours();
        const minutes = time.minutes();
        const seconds = time.seconds();

        // Clear the canvas
        ctx.clearRect(0, 0, this.clockCanvas.width, this.clockCanvas.height);

        // Draw clock face
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0078d7";
        ctx.stroke();

        // Draw clock numbers
        ctx.fillStyle = "#333";
        ctx.font = "16px Arial";
        for (let i = 1; i <= 12; i++) {
            const angle = (i * Math.PI) / 6 - Math.PI / 2;
            const x = 100 + Math.cos(angle) * 75;
            const y = 100 + Math.sin(angle) * 75;
            ctx.fillText(i.toString(), x - 5, y + 5);
        }

        // Draw clock hands
        const drawHand = (length: number, angle: number, width: number) => {
            ctx.lineWidth = width;
            ctx.strokeStyle = "#333";
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(
                100 + length * Math.cos(angle - Math.PI / 2),
                100 + length * Math.sin(angle - Math.PI / 2)
            );
            ctx.stroke();
        };

        // Hour hand
        drawHand(50, (hours % 12) * (Math.PI / 6) + (minutes * Math.PI) / 360, 6);

        // Minute hand
        drawHand(70, (minutes * Math.PI) / 30 + (seconds * Math.PI) / 1800, 4);

        // Second hand
        drawHand(80, (seconds * Math.PI) / 30, 2);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {}

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Clear the interval when the component is destroyed
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}
