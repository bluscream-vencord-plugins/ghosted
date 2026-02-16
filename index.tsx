//// Plugin originally written for Equicord at 2026-02-16 by https://github.com/Bluscream, https://antigravity.google
// region Imports
import "./styles.css";

import { Menu, Tooltip, useEffect, useState } from "@webpack/common";
import { findGroupChildrenByChildId } from "@api/ContextMenu";
import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs, EquicordDevs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { Logger } from "@utils/Logger";
import { closeModal, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Channel } from "@vencord/discord-types";

import { settings } from "./settings";
import { Boo, clearChannelFromGhost, getBooCount, getGhostedChannels, onBooCountChange } from "./Boo";
import { getChannelDisplayName, GhostedUsersModal } from "./GhostedUsersModal";
import { IconGhost } from "./IconGhost";
// endregion Imports

import { pluginInfo } from "./info";
export { pluginInfo };

// region Variables
export const logger = new Logger(pluginInfo.id, pluginInfo.color);
export const cl = classNameFactory("vc-boo-");
// endregion Variables

// region Utils
function makeContextItem(props: { channel: Channel }) {
    return (
        <Menu.MenuItem
            id="ec-ghosted-clear"
            key="ec-ghosted-clear"
            label="unghost"
            action={() => {
                clearChannelFromGhost(props.channel.id);
            }}
        />
    );
}
// endregion Utils

// region Components
function BooIndicator() {
    const [count, setCount] = useState(getBooCount());

    useEffect(() => {
        const unsubscribe = onBooCountChange(newCount => {
            setCount(newCount);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (!settings.store.showIndicator) return null;

    const handleClick = () => {
        const ghostedChannels = getGhostedChannels();
        const modalKey = openModal(modalProps => (
            <ErrorBoundary>
                <GhostedUsersModal
                    modalProps={modalProps}
                    ghostedChannels={ghostedChannels}
                    onClose={() => closeModal(modalKey)}
                    onClearGhost={clearChannelFromGhost}
                />
            </ErrorBoundary>
        ));
    };

    const getTooltipText = () => {
        const ghostedChannels = getGhostedChannels();
        if (ghostedChannels.length === 0) {
            return "No Ghosted Users";
        }
        if (ghostedChannels.length <= 5) {
            return ghostedChannels
                .map(id => getChannelDisplayName(id))
                .join(", ");
        }
        return `${ghostedChannels.length} Ghosted Users`;
    };

    if (!getGhostedChannels().length) return null;

    return (
        <div id={cl("container")}>
            <Tooltip text={getTooltipText()} position="right">
                {({ onMouseEnter, onMouseLeave }) => (
                    <div
                        id={cl("container")}
                        className={cl("clickable")}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={handleClick}
                    >
                        {count} <IconGhost fill="currentColor" />
                    </div>
                )}
            </Tooltip>
        </div>
    );
}
// endregion Components

// region Definition
export default definePlugin({
    name: pluginInfo.name,
    description: pluginInfo.description,
    authors: pluginInfo.authors,
    settings,
    dependencies: ["AudioPlayerAPI", "ServerListAPI"],
    contextMenus: {
        "gdm-context": (menuItems, props) => {
            const group = findGroupChildrenByChildId("leave", menuItems, true);
            group?.unshift(makeContextItem(props));
        },
        "user-context": (menuItems, props) => {
            const group = findGroupChildrenByChildId("close-dm", menuItems);
            group?.push(makeContextItem(props));
        }
    },

    patches: [
        {
            find: "PrivateChannel.renderAvatar",
            replacement: {
                match: /\]:\i\|\|\i.{0,50}children:\[/,
                replace: "$&$self.renderBoo(arguments[0]),"
            }
        },
    ],

    renderBoo(props: { channel: Channel; }) {
        return (
            <ErrorBoundary noop>
                <Boo {...props} />
            </ErrorBoundary>
        );
    },

    renderIndicator() {
        return (
            <ErrorBoundary noop>
                <BooIndicator />
            </ErrorBoundary>
        );
    },

    start() {
        addServerListElement(ServerListRenderPosition.Above, this.renderIndicator);
    },

    stop() {
        removeServerListElement(ServerListRenderPosition.Above, this.renderIndicator);
    },
});
// endregion Definition
