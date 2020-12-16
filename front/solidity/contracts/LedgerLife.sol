pragma solidity ^0.5.0;

contract LedgerLife {
    uint8 constant FREE = 0;
    uint8 constant MAX_BUY_COUNT = 20;
    uint8 constant GRID_WIDTH = 32;
    uint8 constant GRID_HEIGHT = 32;
    uint8 constant GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

    struct Player {
        address addr;
        uint16 cellCount;
    }
    Player[255] public players;

    uint8[GRID_SIZE] public grid;

    // take ownership of a list of cells
    function buyCells(
        uint240 cells,
        uint8 cellCount,
        uint8 playerID
    ) public {
        // max 20 cells can be bought in a single call
        require(cellCount > 0 && cellCount <= MAX_BUY_COUNT);

        // check that the playerID matches the caller address
        require(players[playerID].addr == msg.sender);

        // assign each cell to the player's ID
        for (uint8 index = 0; index < cellCount; index++) {
            uint16 cell_index = (uint16)(cells & 0x0FFF);
            cells = cells >> 12;
            // check that the cell is contained in the grid
            require(cell_index >= 0 && cell_index < (GRID_SIZE));
            // check that the cell is not yet owned
            require(grid[cell_index] == FREE);
            grid[cell_index] = playerID;
        }

        // finally, increase the player's cell count
        players[playerID].cellCount += cellCount;
    }

    // internal function used to add new cells created via reproduction
    function _add_cell(
        uint8[GRID_SIZE] memory m_grid,
        uint8 x,
        uint8 y,
        uint8 playerID
    ) private {
        require(x < GRID_WIDTH);
        require(y < GRID_HEIGHT);
        require(playerID != FREE);
        // if the player has less than 1 cell, there is no way he'd get a new cell by reproduction
        require(players[playerID].cellCount > 0);
        players[playerID].cellCount++;
        m_grid[y * GRID_WIDTH + x] = playerID;
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
        uint8 x,
        uint8 y
    ) private pure returns (uint8) {
        if (x > 0 && y > 0) {
            return
                is_owned(m_grid[(y - 1) * 32 + x - 1]) +
                is_owned(m_grid[(y - 1) * 32 + x]) +
                is_owned(m_grid[(y - 1) * 32 + x + 1]) +
                is_owned(m_grid[(y) * 32 + x - 1]) +
                is_owned(m_grid[(y) * 32 + x + 1]) +
                is_owned(m_grid[(y + 1) * 32 + x - 1]) +
                is_owned(m_grid[(y + 1) * 32 + x]) +
                is_owned(m_grid[(y + 1) * 32 + x + 1]);
        } else if (x == 0 && y > 0) {
            return
                is_owned(m_grid[(y - 1) * 32 + x]) +
                is_owned(m_grid[(y - 1) * 32 + x + 1]) +
                is_owned(m_grid[(y) * 32 + x + 1]) +
                is_owned(m_grid[(y + 1) * 32 + x]) +
                is_owned(m_grid[(y + 1) * 32 + x + 1]);
        } else if (x > 0 && y == 0) {
            return
                is_owned(m_grid[(y) * 32 + x - 1]) +
                is_owned(m_grid[(y) * 32 + x + 1]) +
                is_owned(m_grid[(y + 1) * 32 + x - 1]) +
                is_owned(m_grid[(y + 1) * 32 + x]) +
                is_owned(m_grid[(y + 1) * 32 + x + 1]);
        } else {
            return
                is_owned(m_grid[(y) * 32 + x + 1]) +
                is_owned(m_grid[(y + 1) * 32 + x]) +
                is_owned(m_grid[(y + 1) * 32 + x + 1]);
        }
    }

    function life() public {
        uint8[GRID_SIZE] memory m_grid = grid;
        for (uint16 index = 0; index < m_grid.length; index++) {
            uint8 x = uint8(index % 32);
            uint8 y = uint8(index / 32);
            uint8 neighboursCount = count_neighbours(m_grid, x, y);
            if (is_owned(m_grid[index]) != 0) {
                if (neighboursCount < 2 || neighboursCount > 3) {
                    _remove_cell(m_grid, x, y);
                }
            } else {
                if (neighboursCount == 3) {
                    uint8 newCellOwner = get_winner_neighbour(
                        m_grid,
                        int8(x),
                        int8(y)
                    );
                    _add_cell(m_grid, x, y, newCellOwner);
                }
            }
        }
    }

    function getGrid() public view returns (uint8[GRID_SIZE] memory) {
        return grid;
    }

    function getPlayers() public view returns (address[255] memory) {
        address[255] memory playersList;
        for (uint8 i = 0; i < players.length; i++) {
            playersList[i] = players[i].addr;
        }
        return playersList;
    }
}
