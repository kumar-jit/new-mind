import React, { useState } from 'react';
import styled from 'styled-components';
import { FiFolder, FiFileText, FiMoreVertical, FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f4f7fc;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #1d2654;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 70px;
    padding: 10px;
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

const FolderList = styled.div`
  margin-top: 20px;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  background: #2c3662;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;

  .icon {
    margin-right: 10px;
  }
`;

const Header = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Table = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  padding: 16px;
  background: #e9eef7;
  font-weight: bold;
  justify-content: space-between;
`;

const TableRow = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  justify-content: space-between;
`;

const Fab = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #1d2654;
  color: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;

  button {
    display: block;
    padding: 10px 20px;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #f4f4f4;
    }
  }
`;

export default function FileManagerPage() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Container>
      <Sidebar>
        <Header>Folders & Documents</Header>
        <FolderList>
          <FolderItem><span><FiFolder className="icon" /> Mission Logs</span><span>5</span></FolderItem>
          <FolderItem><span><FiFolder className="icon" /> Satellite Data</span><span>2</span></FolderItem>
          <FolderItem><span><FiFolder className="icon" /> Open Source Tools</span><span>3</span></FolderItem>
          <FolderItem><span><FiFolder className="icon" /> Cybersecurity Reports</span><span>5</span></FolderItem>
        </FolderList>
      </Sidebar>
      <Main>
        <Table>
          <TableHeader>
            <span>Name</span>
            <span>Updated</span>
          </TableHeader>
          <TableRow>
            <span><FiFolder className="icon" /> Mission Logs</span>
            <span>17/03/2025 23:30</span>
          </TableRow>
          <TableRow>
            <span><FiFolder className="icon" /> Satellite Data</span>
            <span>17/03/2025 23:30</span>
          </TableRow>
          <TableRow>
            <span><FiFolder className="icon" /> Cybersecurity Reports</span>
            <span>17/03/2025 23:30</span>
          </TableRow>
        </Table>
      </Main>

      <Fab onClick={() => setShowDropdown(!showDropdown)}>
        <FiPlus />
      </Fab>
      {showDropdown && (
        <Dropdown>
          <button><FiUpload className="icon" /> Upload Document</button>
          <button><FiFolder className="icon" /> Create Folder</button>
        </Dropdown>
      )}
    </Container>
  );
}
