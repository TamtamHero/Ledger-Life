pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract LedgerLife {
    uint8 constant SIZE256 = 32;
    uint8 constant FREE = 0;
    uint8 constant MAX_BUY_COUNT = 20;
    uint8 constant GRID_WIDTH = 32;
    uint8 constant GRID_HEIGHT = 32;
    uint16 constant GRID_SIZE = 1024;
    uint16 constant STORAGE_SIZE = 32; // GRID_SIZE/SIZE256 + 1

    struct Player {
        address addr;
        uint16 cellCount;
    }
    Player[256] public players;

    uint256[STORAGE_SIZE] public grid;

    function _read_cell(uint16 index) private view returns(uint8){
        uint8 segment_num = uint8(index / SIZE256);
        uint8 element_num = uint8(index % SIZE256);
        uint256 segment = grid[segment_num];
        segment >>= ((SIZE256-element_num-1) * 8);
        return uint8(segment);
    }

    function _write_cell(uint16 index, uint8 value) private {
        uint8 segment_num = uint8(index / SIZE256);
        uint8 element_num = uint8(index % SIZE256);
        uint256 mask = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        mask = mask ^ (uint256(0xFF) << ((SIZE256-element_num-1) * 8));

        uint256 segment = grid[segment_num];
        segment &= mask;
        segment |= uint256(value) << ((SIZE256-element_num-1) * 8);
        grid[segment_num] = segment;
    }

    function _unpack_grid() private view returns(uint8[GRID_SIZE] memory){
        uint8[GRID_SIZE] memory m_grid;
        uint16 index=0;
        for (uint8 i = 0; i < STORAGE_SIZE; i++) {
            uint256 segment = grid[i];
            for (uint8 j = 0; j < SIZE256 && index < GRID_SIZE; j++) {
                m_grid[index] = uint8(segment >> ((SIZE256-j-1) * 8));
                index++;
            }
        }
        return m_grid;
    }

    function _pack_grid(uint8[GRID_SIZE] memory m_grid) private {
        uint16 index=0;
        for (uint8 i = 0; i < STORAGE_SIZE; i++) {
            uint256 segment = 0;
            for (uint8 j = 0; j < SIZE256 && index < GRID_SIZE; j++) {
                segment <<= 8;
                segment += m_grid[index];
                index++;
            }
            grid[i] = segment;
        }
    }

    // take ownership of a list of cells
    function buyCells(
        uint240 cells,
        uint8 cellCount,
        uint8 playerID
    ) public {
        // max 20 cells can be bought in a single call
        require(cellCount > 0 && cellCount <= MAX_BUY_COUNT);

        if(players[playerID].addr == address(0)){
            players[playerID].addr = msg.sender;
        }
        else{
            // check that the playerID matches the caller address
            require(players[playerID].addr == msg.sender);
        }

        // assign each cell to the player's ID
        for (uint8 index = 0; index < cellCount; index++) {
            uint16 cell_index = (uint16)(cells & 0x0FFF);
            cells = cells >> 12;
            // check that the cell is contained in the grid
            require(cell_index >= 0 && cell_index < GRID_SIZE);
            // check that the cell is not yet owned
            uint8 cell_owner = _read_cell(cell_index);
            require(cell_owner == FREE);
            _write_cell(cell_index, playerID);
        }

        // finally, increase the player's cell count
        players[playerID].cellCount += cellCount;
    }

    // internal function used to add new cells created via reproduction
    function _add_cell(
        uint8[GRID_SIZE] memory m_grid,
        uint16 index,
        uint8 playerID
    ) private {
        require(index < GRID_SIZE);
        require(playerID != FREE);
        // if the player has less than 1 cell, there is no way he'd get a new cell by reproduction
        require(players[playerID].cellCount > 0);
        players[playerID].cellCount++;
        m_grid[index] = playerID;
    }

    function _remove_cell(
        uint8[GRID_SIZE] memory m_grid,
        uint8 x,
        uint8 y
    ) private {
        require(x < GRID_WIDTH);
        require(y < GRID_HEIGHT);
        uint8 playerID = m_grid[y * GRID_SIZE + x];
        require(playerID != FREE);
        m_grid[y * GRID_WIDTH + x] = FREE;
        require(players[playerID].cellCount > 0);
        players[playerID].cellCount -= 1;
    }

    function is_owned(uint8 cell) private pure returns (uint8) {
        if (cell != 0) {
            return 1;
        }
        return 0;
    }

    struct Coordinate {
        int8 x;
        int8 y;
    }

    function _contains(uint8[3] memory array, uint8 value)
        private
        pure
        returns (bool)
    {
        for (uint8 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }

    function get_winner_neighbour(
        uint8[GRID_SIZE] memory m_grid,
        int8 x,
        int8 y
    ) private pure returns (uint8) {
        Coordinate[8] memory neighbours = [
            Coordinate(x - 1, y - 1),
            Coordinate(x - 1, y),
            Coordinate(x - 1, y + 1),
            Coordinate(x, y - 1),
            Coordinate(x, y + 1),
            Coordinate(x + 1, y - 1),
            Coordinate(x + 1, y),
            Coordinate(x + 1, y + 1)
        ];

        uint8[3] memory neighboursList;
        uint8 firstNeighbour = 0;
        uint8 neighboursCount = 0;
        uint8 winner = 0;
        uint8 neighbourIndex = 0;

        for (uint8 i = 0; i < neighbours.length; i++) {
            if (
                neighbours[i].x >= 0 &&
                neighbours[i].x < int8(GRID_WIDTH) &&
                neighbours[i].y >= 0 &&
                neighbours[i].y < int8(GRID_HEIGHT)
            ) {
                uint8 _x = uint8(neighbours[i].x);
                uint8 _y = uint8(neighbours[i].y);
                uint8 currentNeighbour = m_grid[_x + GRID_WIDTH * _y];
                if (currentNeighbour != 0) {
                    firstNeighbour = firstNeighbour != 0
                        ? firstNeighbour
                        : currentNeighbour;
                    neighboursCount++;
                    if (_contains(neighboursList, currentNeighbour)) {
                        winner = currentNeighbour;
                    } else {
                        require(neighbourIndex < 3);
                        neighboursList[neighbourIndex] = currentNeighbour;
                        neighbourIndex++;
                    }
                }
            }
        }
        // If there is no majority neighbour, then the first neighbour wins
        winner = winner != 0 ? winner : firstNeighbour;
        require(neighboursCount == 3);
        require(winner != 0);
        return winner;
    }

    function count_neighbours(
        uint8[GRID_SIZE] memory m_grid,
        int8 x,
        int8 y
    ) private pure returns (uint8) {
        Coordinate[8] memory neighbours = [
            Coordinate(x - 1, y - 1),
            Coordinate(x - 1, y),
            Coordinate(x - 1, y + 1),
            Coordinate(x, y - 1),
            Coordinate(x, y + 1),
            Coordinate(x + 1, y - 1),
            Coordinate(x + 1, y),
            Coordinate(x + 1, y + 1)
        ];

        uint8 neighboursCount = 0;

        for (uint8 i = 0; i < neighbours.length; i++) {
            if (
                neighbours[i].x >= 0 &&
                neighbours[i].x < int8(GRID_WIDTH) &&
                neighbours[i].y >= 0 &&
                neighbours[i].y < int8(GRID_HEIGHT)
            ) {
                uint8 _x = uint8(neighbours[i].x);
                uint8 _y = uint8(neighbours[i].y);
                if(m_grid[_x + GRID_WIDTH* _y] != FREE){
                    neighboursCount++;
                }
            }
        }
        return neighboursCount;
    }

    function life() public {
        uint8[GRID_SIZE] memory m_grid_old = _unpack_grid();
        uint8[GRID_SIZE] memory m_grid_new;
        for (uint16 index = 0; index < GRID_SIZE; index++) {
            int8 x = int8(index % GRID_WIDTH);
            int8 y = int8(index / GRID_HEIGHT);
            uint8 neighboursCount = count_neighbours(m_grid_old, x, y);
            if (neighboursCount == 3 && m_grid_old[index] == FREE ) {
                uint8 newCellOwner = get_winner_neighbour(
                    m_grid_old,
                    x, y
                );
                _add_cell(m_grid_new, index, newCellOwner);
            }
            else if ( m_grid_old[index] != FREE && (neighboursCount >= 2 && neighboursCount <= 3)) {
                _add_cell(m_grid_new, index, m_grid_old[index]);
            }
        }
        _pack_grid(m_grid_new);
    }

    function getGrid() public view returns (uint256[STORAGE_SIZE] memory) {
        return grid;
    }

    function getPlayers() public view returns (Player[256] memory) {
        return players;
    }
}
