import * as React from "react";
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import { Box, Checkbox, FormControl, Typography, Select, MenuItem } from "@mui/material";
import { CLIModViewCommand, CLIModViewCommandGroup, CLIModViewCommandGroups, CLIModViewCommands, CLIModViewProfile } from "./CLIModuleCommon";


interface CLIModGeneratorProfileCommandTreeProps {
    profileCommandTree: ProfileCommandTree,
    onChange: (newProfileCommandTree: ProfileCommandTree) => void,
}

interface CLIModGeneratorProfileCommandTreeSate {

}

class CLIModGeneratorProfileCommandTree extends React.Component<CLIModGeneratorProfileCommandTreeProps, CLIModGeneratorProfileCommandTreeSate> {

    onSelectCommandGroup = (commandGroupId: string, selected: boolean) => {
        let newTree = updateProfileCommandTree(this.props.profileCommandTree, commandGroupId, selected);
        this.props.onChange(newTree);
    }

    onSelectCommand = (commandId: string, selected: boolean) => {
        let newTree = updateProfileCommandTree(this.props.profileCommandTree, commandId, selected);
        this.props.onChange(newTree);
    }

    onSelectCommandVersion = (commandId: string, version: string) => {
        let newTree = updateProfileCommandTree(this.props.profileCommandTree, commandId, true, version);
        this.props.onChange(newTree);
    }

    onSelectCommandRegistered = (commandId: string, registered: boolean) => {
        let newTree = updateProfileCommandTree(this.props.profileCommandTree, commandId, true, undefined, registered);
        this.props.onChange(newTree);
    }

    render() {
        const renderCommand = (command: ProfileCTCommand) => {
            const leafName = command.names[command.names.length - 1];
            const selected = command.selectedVersion !== undefined;
            return (
                <TreeItem key={command.id} nodeId={command.id} color='inherit' label={<Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start"
                }}>
                    <Checkbox
                        disableRipple
                        checked={selected}
                        onClick={(event) => {
                            this.onSelectCommand(command.id, !selected);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                    />
                    <DescriptionIcon />
                    <Typography>{leafName}</Typography>
                    {command.selectedVersion !== undefined && <FormControl variant="standard" sx={{
                        m: 1,
                        minWidth: 120,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start"
                    }}>
                        <Select
                            sx={{
                                minWidth: 150,
                            }}
                            id={`${command.id}-version-select`}
                            value={command.selectedVersion}
                            onChange={(event) => {
                                this.onSelectCommandVersion(command.id, event.target.value);
                            }}
                            size="small"
                        >
                            {command.versions.map((version) => {
                                return (<MenuItem value={version.name} key={`${command.id}-version-select-${version.name}`}>
                                    {version.name}
                                </MenuItem>);
                            })}
                        </Select>

                        <Select
                            sx={{
                                minWidth: 150,
                            }}
                            id={`${command.id}-register-select`}
                            value={command.registered ? 1 : 0}
                            onChange={(event) => {
                                this.onSelectCommandRegistered(command.id, event.target.value === 1);
                            }}
                            size="small"
                        >
                            <MenuItem value={1} key={`${command.id}-register-select-registered`}>
                                Registered Command
                            </MenuItem>
                            <MenuItem value={0} key={`${command.id}-register-select-unregistered`}>
                                Unregistered Command
                            </MenuItem>
                        </Select>

                    </FormControl>}

                </Box>}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                />
            )
        }

        const renderCommandGroup = (commandGroup: ProfileCTCommandGroup) => {
            const nodeName = commandGroup.names[commandGroup.names.length - 1];
            const selected = commandGroup.selectedCommands > 0 && commandGroup.totalCommands === commandGroup.selectedCommands;
            return (
                <TreeItem key={commandGroup.id} nodeId={commandGroup.id} color='inherit' label={<Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start"
                }}>
                    <Checkbox
                        disableRipple
                        checked={selected}
                        indeterminate={!selected && commandGroup.selectedCommands > 0}
                        onClick={(event) => {
                            this.onSelectCommandGroup(commandGroup.id, !selected);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                    />
                    <FolderIcon />
                    <Typography>{nodeName}</Typography>
                </Box>}
                    onClick={(event) => {

                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    {commandGroup.commands !== undefined && commandGroup.commands.map((command) => renderCommand(command))}
                    {commandGroup.commandGroups !== undefined && commandGroup.commandGroups.map((group) => renderCommandGroup(group))}
                </TreeItem>
            )
        }

        return (<React.Fragment>
            <TreeView
                disableSelection={true}
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}>
                {this.props.profileCommandTree.commandGroups.map((commandGroup) => renderCommandGroup(commandGroup))}
            </TreeView>
        </React.Fragment>)
    }
}

interface ProfileCommandTree {
    name: string;
    commandGroups: ProfileCTCommandGroup[];
};

interface ProfileCTCommandGroup {
    id: string;
    names: string[];
    help: string;

    commandGroups?: ProfileCTCommandGroup[];
    commands?: ProfileCTCommand[];

    totalCommands: number;
    selectedCommands: number;
};

interface ProfileCTCommand {
    id: string;
    names: string[];
    help: string;

    versions: ProfileCTCommandVersion[];

    selectedVersion?: string;
    registered?: boolean;
};

interface ProfileCTCommandVersion {
    name: string;
    stage: string;
};

function decodeProfileCTCommandVersion(response: any): ProfileCTCommandVersion {
    return {
        name: response.name,
        stage: response.stage,
    }
}


function decodeProfileCTCommand(response: any): ProfileCTCommand {
    let versions = response.versions.map((value: any) => decodeProfileCTCommandVersion(value));
    return {
        id: response.names.join('/'),
        names: [...response.names],
        help: response.help.short,
        versions: versions,
    }
}

function decodeProfileCTCommandGroup(response: any): ProfileCTCommandGroup {
    let commands = response.commands !== undefined ? Object.keys(response.commands).map((name: string) => decodeProfileCTCommand(response.commands[name])) : undefined;
    let commandGroups = response.commandGroups !== undefined ? Object.keys(response.commandGroups).map((name: string) => decodeProfileCTCommandGroup(response.commandGroups[name])) : undefined;
    let totalCommands = commands?.length ?? 0;
    totalCommands = commandGroups?.reduce((previousValue, value) => previousValue + value.totalCommands, totalCommands) ?? totalCommands;
    return {
        id: response.names.join('/'),
        names: [...response.names],
        help: response.help.short,
        commandGroups: commandGroups,
        commands: commands,
        totalCommands: totalCommands,
        selectedCommands: 0,
    }
}

function BuildProfileCommandTree(profileName: string, response: any,): ProfileCommandTree {
    let commandGroups: ProfileCTCommandGroup[] = response.commandGroups !== undefined ? Object.keys(response.commandGroups).map((name: string) => decodeProfileCTCommandGroup(response.commandGroups[name])) : [];

    return {
        name: profileName,
        commandGroups: commandGroups,
    }
}

function updateCommand(command: ProfileCTCommand, commandId: string, selected: boolean, version: string | undefined, registered: boolean | undefined): ProfileCTCommand {
    if (command.id !== commandId) {
        return command;
    }

    if (selected) {
        let selectedVersion = version ?? command.selectedVersion ?? command.versions[0].name;
        let registerCommand = registered ?? command.registered ?? true;
        return {
            ...command,
            selectedVersion: selectedVersion,
            registered: registerCommand,
        }

    } else {
        return {
            ...command,
            selectedVersion: undefined,
        }
    }
}

function updateCommandGroup(commandGroup: ProfileCTCommandGroup, id: string, selected: boolean, version: string | undefined, registered: boolean | undefined): ProfileCTCommandGroup {
    if (commandGroup.id !== id && !id.startsWith(`${commandGroup.id}/`)) {
        return commandGroup;
    }
    let commands: ProfileCTCommand[] | undefined = undefined;
    let commandGroups: ProfileCTCommandGroup[] | undefined = undefined;

    if (commandGroup.id === id) {
        commands = commandGroup.commands?.map((value) => updateCommand(value, value.id, selected, version, registered));
        commandGroups = commandGroup.commandGroups?.map((value) => updateCommandGroup(value, value.id, selected, version, registered));
    } else {
        commands = commandGroup.commands?.map((value) => updateCommand(value, id, selected, version, registered));
        commandGroups = commandGroup.commandGroups?.map((value) => updateCommandGroup(value, id, selected, version, registered));
    }

    let selectedCommands = commands?.reduce((pre, value) => { return value.selectedVersion !== undefined ? pre + 1 : pre }, 0) ?? 0;
    selectedCommands += commandGroups?.reduce((pre, value) => { return pre + value.selectedCommands }, 0) ?? 0;

    return {
        ...commandGroup,
        commands: commands,
        commandGroups: commandGroups,
        selectedCommands: selectedCommands,
    }
}

function updateProfileCommandTree(tree: ProfileCommandTree, id: string, selected: boolean, version: string | undefined = undefined, registered: boolean | undefined = undefined): ProfileCommandTree {
    let commandGroups = tree.commandGroups.map((value) => updateCommandGroup(value, id, selected, version, registered));
    return {
        ...tree,
        commandGroups: commandGroups
    }
}

function updateCommandByModView(command: ProfileCTCommand, view: CLIModViewCommand): ProfileCTCommand {
    if (command.id !== view.names.join('/')) {
        throw new Error("Invalid command names: " + view.names.join(' '))
    }
    return {
        ...command,
        selectedVersion: view.version,
        registered: view.registered,
    }
}

function updateCommandGroupByModView(commandGroup: ProfileCTCommandGroup, view: CLIModViewCommandGroup): ProfileCTCommandGroup {
    if (commandGroup.id !== view.names.join('/')) {
        throw new Error("Invalid command group names: " + view.names.join(' '))
    }
    let commands: ProfileCTCommand[] | undefined = undefined;
    if (view.commands !== undefined) {
        let keys = new Set(Object.keys(view.commands!));
        commands = commandGroup.commands?.map((value) => {
            if (keys.has(value.names[value.names.length - 1])) {
                keys.delete(value.names[value.names.length - 1])
                return updateCommandByModView(value, view.commands![value.names[value.names.length - 1]])
            } else {
                return value;
            }
        })
        if (keys.size > 0) {
            let commandNames: string[] = [];
            keys.forEach(key => {
                commandNames.push('`az ' + view.commands![key].names.join(" ") + '`')
            })
            throw new Error("Miss commands in aaz: " + commandNames.join(', '))
        }
    }

    let commandGroups: ProfileCTCommandGroup[] | undefined = undefined;
    if (view.commandGroups !== undefined) {
        let keys = new Set(Object.keys(view.commandGroups!));
        commandGroups = commandGroup.commandGroups?.map((value) => {
            if (keys.has(value.names[value.names.length - 1])) {
                keys.delete(value.names[value.names.length - 1])
                return updateCommandGroupByModView(value, view.commandGroups![value.names[value.names.length - 1]])
            } else {
                return value;
            }
        })
        if (keys.size > 0) {
            let commandGroupNames: string[] = [];
            keys.forEach(key => {
                commandGroupNames.push('`az ' + view.commandGroups![key].names.join(" ") + '`')
            })
            throw new Error("Miss command groups in aaz: " + commandGroupNames.join(', '))
        }
    }

    let selectedCommands = commands?.reduce((pre, value) => { return value.selectedVersion !== undefined ? pre + 1 : pre }, 0) ?? 0;
    selectedCommands += commandGroups?.reduce((pre, value) => { return pre + value.selectedCommands }, 0) ?? 0;
    return {
        ...commandGroup,
        commands: commands,
        commandGroups: commandGroups,
        selectedCommands: selectedCommands,
    }
}

function UpdateProfileCommandTreeByModView(tree: ProfileCommandTree, view: CLIModViewProfile): ProfileCommandTree {
    let commandGroups: ProfileCTCommandGroup[] = [];
    if (view.commandGroups !== undefined) {
        let keys = new Set(Object.keys(view.commandGroups));
        commandGroups = tree.commandGroups.map((value) => {
            if (keys.has(value.names[value.names.length - 1])) {
                keys.delete(value.names[value.names.length - 1])
                return updateCommandGroupByModView(value, view.commandGroups![value.names[value.names.length - 1]])
            } else {
                return value;
            }
        })
        if (keys.size > 0) {
            let commandGroupNames: string[] = [];
            keys.forEach(key => {
                commandGroupNames.push('`az ' + view.commandGroups![key].names.join(" ") + '`')
            })
            throw new Error("Miss command groups in aaz: " + commandGroupNames.join(', '))
        }
    }

    return {
        ...tree,
        commandGroups: commandGroups
    }
}

function ExportModViewCommand(command: ProfileCTCommand): CLIModViewCommand | undefined {
    if (command.selectedVersion === undefined) {
        return undefined
    }

    return {
        names: command.names,
        registered: command.registered!,
        version: command.selectedVersion!,
    }
}

function ExportModViewCommandGroup(commandGroup: ProfileCTCommandGroup): CLIModViewCommandGroup | undefined {
    if (commandGroup.selectedCommands === 0) {
        return undefined
    }

    let commands: CLIModViewCommands | undefined = undefined;
    if (commandGroup.commands !== undefined) {
        commands = {}
        
        commandGroup.commands!.forEach(value => {
            let view = ExportModViewCommand(value);
            if (view !== undefined) {
                commands![value.names[value.names.length - 1]] = view;
            }
        })
    }

    let commandGroups: CLIModViewCommandGroups | undefined = undefined;
    if (commandGroup.commandGroups !== undefined) {
        commandGroups = {}

        commandGroup.commandGroups!.forEach(value => {
            let view = ExportModViewCommandGroup(value);
            if (view !== undefined) {
                commandGroups![value.names[value.names.length - 1]] = view;
            }
        })
    }
    return {
        names: commandGroup.names,
        commandGroups: commandGroups,
        commands: commands
    }
}


function ExportModViewProfile(tree: ProfileCommandTree): CLIModViewProfile {
    let commandGroups: CLIModViewCommandGroups = {};

    tree.commandGroups.forEach(value => {
        let view = ExportModViewCommandGroup(value);
        if (view !== undefined) {
            commandGroups[value.names[value.names.length - 1]] = view;
        }
    })

    return {
        name: tree.name,
        commandGroups: commandGroups
    }
}

export default CLIModGeneratorProfileCommandTree;

export type { ProfileCommandTree, }

export { BuildProfileCommandTree, UpdateProfileCommandTreeByModView, ExportModViewProfile }