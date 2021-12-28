import styled from "styled-components";

export default styled.div`
  height: ${(props) => `calc(100vh - ${props.theme.smallHeaderHeight})`};
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
`;
interface Box {
  align?: string;
  justify?: string;
  full?: boolean;
}

export const Box = styled.div<Box>`
  display: flex;
  height: ${(props) =>
    props.full && `calc(100vh - ${props.theme.smallHeaderHeight})`};
  width: ${(props) => props.full && "100vw"};
  justify-content: ${(props) => props.justify};
  align-items: ${(props) => props.align};
`;
