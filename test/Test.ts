import assert from "assert";
import { 
  TestHelpers,
  ERC1967Proxy_Deposited
} from "generated";
const { MockDb, ERC1967Proxy } = TestHelpers;

describe("ERC1967Proxy contract Deposited event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for ERC1967Proxy contract Deposited event
  const event = ERC1967Proxy.Deposited.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("ERC1967Proxy_Deposited is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await ERC1967Proxy.Deposited.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualERC1967ProxyDeposited = mockDbUpdated.entities.ERC1967Proxy_Deposited.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedERC1967ProxyDeposited: ERC1967Proxy_Deposited = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      _depositor: event.params._depositor,
      _pool: event.params._pool,
      _commitment: event.params._commitment,
      _amount: event.params._amount,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualERC1967ProxyDeposited, expectedERC1967ProxyDeposited, "Actual ERC1967ProxyDeposited should be the same as the expectedERC1967ProxyDeposited");
  });
});
