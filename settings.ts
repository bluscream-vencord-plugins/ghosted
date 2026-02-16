import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    showIndicator: {
        type: OptionType.BOOLEAN,
        description: "Show the ghost counter at the top of the server list",
        default: true,
        restartNeeded: false,
    },
    showDmIcons: {
        type: OptionType.BOOLEAN,
        description: "Show ghost icons next to individual DMs",
        default: true,
        restartNeeded: false,
    },
    ignoreGroupDms: {
        type: OptionType.BOOLEAN,
        description: "Exclude all group DMs from ghosting",
        default: false,
        restartNeeded: false,
    },
    exemptedChannels: {
        type: OptionType.STRING,
        description: "Comma-separated list of channel IDs to exempt from ghosting (right-click a DM channel to copy its ID)",
        default: "",
        restartNeeded: false,
    },
    ignoreBots: {
        type: OptionType.BOOLEAN,
        description: "Ignore DMs from bots",
        default: true,
        restartNeeded: false,
    },
});
