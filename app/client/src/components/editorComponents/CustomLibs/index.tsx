import { initializeInstallation } from "actions/cutomLibsActions";
import Button from "components/ads/Button";
import { TabComponent } from "components/ads/Tabs";
import { debounce } from "lodash";
import React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "reducers";
import styled from "styled-components";
import { ReactComponent as ChevronLeft } from "assets/icons/ads/chevron_left.svg";
import { setGlobalSearchFilterContext } from "actions/globalSearchActions";
import { SEARCH_CATEGORY_ID } from "../GlobalSearch/utils";
import { ExtraLibrary } from "utils/ExtraLibrary";

const LibraryContainer = styled.div`
  background: white;
  padding: 25px 30px;
  height: 600px;
  width: 750px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .react-tabs__tab-panel {
    height: calc(100% - 36px);
  }
  input {
    position: absolute;
    border: 1.2px solid #e0dede;
    top: 58px;
    padding: 8px 12px;
    right: 45px;
    width: 240px;
    height: 35px;
    font-size: 12px;
  }
`;

const LibraryList = styled.div`
  background: white;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const LibraryCard = styled.div`
  display: flex;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  border: 1px solid #f0f0f0;
  margin-bottom: 18px;
  cursor: pointer;
`;

const LibraryInfo = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin: 3px 0;
  }
  .lib-name {
    font-size: 14px;
  }
  .lib-desc {
    font-size: 12px;
  }
`;

const LibraryActions = styled.div`
  display: flex;
  flex-shrink: 0;
  > * {
    margin: 0 5px;
  }
  .uninstall-btn {
    background: #f22b2b;
    color: white;
    border: 1.2px solid #f22b2b;
  }
  .update-btn {
    background: white;
    border: 1.2px solid #716e6e;
    color: #716e6e;
  }
`;

const LibraryHeader = styled.div`
  font-size: 20px;
  color: #090707;
  margin-bottom: 16px;
  font-weight: 500;
  svg {
    cursor: pointer;
  }
  span {
    margin-left: 10px;
  }
`;

const LibraryWrapper = styled.div`
  padding: 10px 15px 10px 0;
  margin-top: 2px;
  border-top: 1px solid #ebebeb;
`;

const FlexWrapper = styled.div`
  flex-grow: 1;
  overflow: auto;
`;

enum INSTALLATION_STATUS {
  INSTALLED,
  NOT_INSTALLED,
}

function LibraryCardComponent(
  lib: any,
  idx: number,
  installationStatus: INSTALLATION_STATUS,
) {
  const dispatch = useDispatch();
  return (
    <LibraryCard key={idx}>
      <LibraryInfo>
        <span className="lib-name">{lib.name}</span>
        <span className="lib-desc">{lib.description}</span>
        <span className="lib-desc">{lib.version}</span>
      </LibraryInfo>
      <LibraryActions>
        {
          {
            [INSTALLATION_STATUS.INSTALLED]: (
              <Button className="uninstall-btn" text="Uninstall" />
            ),
            [INSTALLATION_STATUS.NOT_INSTALLED]: (
              <Button
                className="install-btn"
                onClick={() => dispatch(initializeInstallation(lib))}
                text="Install"
              />
            ),
          }[installationStatus]
        }
      </LibraryActions>
    </LibraryCard>
  );
}

function InstalledLibraries({ query }: { query: string }) {
  const defaultLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.defaultLibraries,
  );
  const additionalLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.additionalLibraries,
  );
  const allLibraries = defaultLibraries.concat(additionalLibraries);
  return (
    <LibraryWrapper>
      <LibraryList>
        {(allLibraries || [])
          .filter(
            (lib) =>
              lib.name.includes(query) || lib.description?.includes(query),
          )
          .map((lib: any, idx: number) => (
            <LibraryCard key={idx}>
              <LibraryInfo>
                <span className="lib-name">{lib.name}</span>
                <span className="lib-desc">{lib.description}</span>
                <span className="lib-desc">{lib.version}</span>
              </LibraryInfo>
              <LibraryActions>
                <Button className="uninstall-btn" text="Uninstall" />
              </LibraryActions>
            </LibraryCard>
          ))}
      </LibraryList>
    </LibraryWrapper>
  );
}

function AllLibraries({ libraries }: any) {
  const dispatch = useDispatch();
  const currentInstallations = useSelector(
    (state: AppState) => state.ui.customLibs.currentInstallations,
  );
  const installLibrary = (lib: any) => {
    dispatch(initializeInstallation(lib));
  };

  const defaultLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.defaultLibraries,
  );
  const additionalLibraries = useSelector(
    (state: AppState) => state.ui.customLibs.additionalLibraries,
  );

  const installedLibraries = defaultLibraries.concat(additionalLibraries);

  return (
    <LibraryWrapper>
      <LibraryList>
        {(libraries || [])
          .filter(
            (lib: any) => !installedLibraries.find((l) => l.url === lib.url),
          )
          .map((lib: any, idx: number) => (
            <LibraryCard key={idx}>
              <LibraryInfo>
                <span className="lib-name">{lib.name}</span>
                <span className="lib-desc">{lib.description}</span>
                <span className="lib-desc">{lib.version}</span>
              </LibraryInfo>
              <LibraryActions>
                {currentInstallations.indexOf(lib.name) === -1 ? (
                  <Button
                    className="install-btn"
                    onClick={() => installLibrary(lib)}
                    text="Install"
                  />
                ) : (
                  "Installing"
                )}
              </LibraryActions>
            </LibraryCard>
          ))}
      </LibraryList>
    </LibraryWrapper>
  );
}

function CustomLibrary() {
  const [libraries, setLibraries] = useState([]),
    [query, setQuery] = useState(""),
    [selectedIndex, setSelectedIndex] = useState(0),
    dispatch = useDispatch();
  const handleLibSearch = useCallback(
    (e: React.ChangeEvent) => {
      const currentQuery = (e.target as HTMLInputElement).value;
      setQuery(currentQuery);
      if (selectedIndex) searchLibrary(currentQuery);
    },
    [selectedIndex],
  );

  useEffect(() => searchLibrary(query), []);

  useEffect(() => setQuery(""), [selectedIndex]);

  const searchLibrary = useCallback(
    debounce((query) => {
      fetch(
        `https://api.cdnjs.com/libraries?fields=filename,description,version&limit=50${
          query ? `&search=${query}` : ""
        }`,
      )
        .then((res) => res.json())
        .then((res) => setLibraries(res.results));
    }, 300),
    [],
  );

  return (
    <LibraryContainer>
      <LibraryHeader>
        <ChevronLeft
          onClick={(e) =>
            dispatch(
              setGlobalSearchFilterContext({
                category: { id: SEARCH_CATEGORY_ID.INIT },
              }),
            )
          }
        />
        <span>JS Libraries</span>
      </LibraryHeader>
      <input onChange={handleLibSearch} placeholder="Search" value={query} />
      <FlexWrapper>
        <TabComponent
          onSelect={(selectedIndex: number) => {
            setSelectedIndex(selectedIndex);
          }}
          selectedIndex={selectedIndex}
          tabs={[
            {
              key: "installed",
              title: "Installed",
              panelComponent: <InstalledLibraries query={query} />,
            },
            {
              key: "all",
              title: "All",
              panelComponent: <AllLibraries libraries={libraries} />,
            },
          ]}
        />
      </FlexWrapper>
    </LibraryContainer>
  );
}

export default CustomLibrary;
