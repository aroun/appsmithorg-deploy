import React, { useState } from "react";
import styled from "styled-components";
import { Collapse, Icon, IconName, Tooltip } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Colors } from "constants/Colors";
import { BindingText } from "pages/Editor/APIEditor/Form";
import { ControlIcons } from "icons/ControlIcons";
import { useDispatch } from "react-redux";
import { toggleShowGlobalSearchModal } from "actions/globalSearchActions";
import { filterCategories } from "components/editorComponents/GlobalSearch/utils";
import { useSelector } from "store";
import { AppState } from "reducers";
const PlusIcon = ControlIcons.INCREASE_CONTROL;

const Wrapper = styled.div`
  font-size: 13px;
`;
const ListItem = styled.li`
  list-style: none;
  color: ${Colors.ALTO};
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 20px 0 20px;
  &:hover {
    background: ${Colors.TUNDORA};
    color: ${Colors.WHITE};
  }
`;
const Name = styled.span``;
const Version = styled.span``;
const Title = styled.div`
  display: flex;
  cursor: pointer;
  height: 30px;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  &:hover {
    background: ${Colors.TUNDORA};
    color: ${Colors.WHITE};
  }
`;
const List = styled.ul`
  padding: 0px;
  margin: 0 0 0 0px;
`;
const Help = styled(Icon)`
  &:hover svg {
    fill: ${Colors.WHITE};
  }
`;

const FlexWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  &.fixed {
    width: 35px;
  }
  span.bp3-popover-target {
    display: flex;
  }
`;

const IconWrapper = styled.div`
  padding-right: 4px;
  cursor: pointer;
  svg {
    cursor: pointer;
  }
`;

export function JSDependencies() {
  const [isOpen, setIsOpen] = useState(false);
  const openDocs = (name: string, url: string) => () => window.open(url, name);
  const defaultLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.defaultLibraries,
  );
  const additionalLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.additionalLibraries,
  );
  const dependencyList = defaultLibraries
    .concat(additionalLibraries)
    .map((lib) => {
      return (
        <ListItem key={lib.name} onClick={openDocs(lib.name, lib.docsURL)}>
          <Name>{lib.name}</Name>
          <Version>{lib.version}</Version>
        </ListItem>
      );
    });
  const icon: IconName = isOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT;
  const toggleDependencies = () => setIsOpen(!isOpen);
  const showDocs = (e: any) => {
    window.open(
      "https://docs.appsmith.com/v/v1.2.1/core-concepts/writing-code/ext-libraries",
      "appsmith-docs:working-with-js-libraries",
    );
    e.stopPropagation();
    e.preventDefault();
  };
  const dispatch = useDispatch();

  const TooltipContent = (
    <div>
      <span>Access these JS libraries to transform data within </span>
      <BindingText>{`{{ }}`}</BindingText>
      <span>. Try </span>
      <BindingText>{`{{ _.add(1,1) }}`}</BindingText>
    </div>
  );
  return (
    <Wrapper>
      <Title onClick={toggleDependencies}>
        <FlexWrapper>
          <Icon icon={icon} />
          <span>JS libraries you can use</span>
        </FlexWrapper>
        <FlexWrapper className="fixed">
          <Tooltip boundary="viewport" content={TooltipContent} position="top">
            <Help
              color={Colors.DOVE_GRAY}
              icon="help"
              iconSize={12}
              onClick={showDocs}
            />
          </Tooltip>
          <IconWrapper
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleShowGlobalSearchModal(filterCategories.LIBRARY));
            }}
          >
            <PlusIcon color="white" height={10} width={10} />
          </IconWrapper>
        </FlexWrapper>
      </Title>
      <Collapse isOpen={isOpen}>
        <List>{dependencyList}</List>
      </Collapse>
    </Wrapper>
  );
}

export default JSDependencies;
