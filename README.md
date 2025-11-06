<div align="center">

<p></p>

<img src="./assets/solana-logo.jpeg" width=120 height=120 alt="Solana logo" />

<p></p>

<h1>SOLx402 MCP Server</h1>

<a href="https://www.x402.org/" target="_blank">
<img src="./assets/x402-badge.png" width=132 alt="x402 Badge">
</a>

<p></p>

<p>SOLx402 MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to interact with the x402 payment protocol on Solana. It provides tools for discovering and consuming x402-enabled services, managing USDC payments, querying protocol documentation, and accessing Solana development resources through integrated MCP clients.</p>

<a href="#" target="_blank">Official page</a>
</div>

## Tools

- ### x402 Protocol

    - **Documentation**
        
        - `search_x402_documentation`: Search across the x402 documentation to find relevant information, code examples, API references, and guides.
        
        - `x402_protocol_flow`: Visual diagram showing the x402 protocol flow and architecture.

    - **Services Discovery**
        
        - `get_x402_services`: Retrieve a list of available x402 services from the facilitator.
        
        - `get_facilitators`: Retrieve a list of known Solana facilitators.

    - **Service Consumption**
        
        - `consume_x402_service`: Consume a specific x402 service with automatic payment handling.
        
            > **⚠️ Note:** x402 services are external services maintained by third-party teams. While these services appear in the discovery layer, they may be temporarily down, unavailable, or experiencing issues. Service availability depends entirely on the external teams managing them.

- ### Wallet Operations

    - **Wallet Info**
        
        - `get_wallet_public_key`: Retrieve the public key of the configured wallet.

    - **Balance**
        
        - `get_wallet_usdc_balance`: Check the USDC token balance of the configured wallet.

- ### Solana Development Resources (Optional)

    - **Expert Assistance**
        
        - `Ask_Solana_Anchor_Framework_Expert`: Ask questions about developing on Solana with the Anchor Framework.
        
        - `Solana_Expert__Ask_For_Help`: Get expert help on Solana development topics, concepts, APIs, SDKs, and errors.

    - **Documentation**
        
        - `Solana_Documentation_Search`: Search documentation across the Solana ecosystem for up-to-date information.

---

## ⚠️ Important: Request Timeout Configuration

**Critical Setup Requirement:** When using this MCP server, it's essential to configure your MCP client with a **minimum request timeout of 60,000ms (60 seconds)** to ensure successful execution of x402 service consumption.

### Why This Matters:

- x402 services are external APIs that may require significant processing time.
- Payment transactions are executed on the Solana blockchain, which can take time to confirm.
- Short timeouts can cause requests to fail **after** USDC has been charged, resulting in payment without receiving the service.
- By default, MCP servers use a maximum request timeout of 10 seconds when running, which is quite low in some cases.

### Configuration Examples:

For **Cline** users, add this to your MCP client configuration:
```json
{
  "mcpServers": {
    "solx402": {
      "url": "",
      "type": "streamable-http",
      "timeout": 60000
    }
  }
}
```

### Related Issues:
- [Cline PR #1904](https://github.com/cline/cline/pull/1904) - Request timeout configuration
- [Cline Issue #4391](https://github.com/cline/cline/issues/4391) - Timeout-related problems

**Note:** Always ensure your MCP client timeout is at least 60 seconds to prevent payment issues and service consumption failures.

---

## .env Config

- `PRIVATE_KEY`: Base58-encoded private key for your Solana wallet (required for x402 service consumption and payments).

- `FACILITATOR_URL`: URL of the x402 facilitator (default: https://facilitator.example.com).

- `MAX_PRICE`: Maximum price to pay for services in USDC microcents (e.g., 10000 = 0.01 USDC).

- `IS_MAINNET`: Set to `true` for mainnet, `false` for devnet.

- `MAINNET_RPC_URL`: Solana RPC URL for mainnet operations.

- `DEVNET_RPC_URL`: Solana RPC URL for devnet operations.

- `USE_SOLANA_MCP_SERVER`: Set to `true` to enable Solana development tools integration (default: false).

- `USE_STREAMABLE_HTTP`: Specifies whether your MCP server will run on stdio or streamable-http (set to `true` or `false`).

- `PORT`: Port where your MCP server will run when using streamable-http (default: 3000).

- `HOST`: Host where your MCP server will run when using streamable-http (default: 127.0.0.1).

## Run the project locally

In one terminal window, run the following command: `pnpm dev` in `stdio` mode.

## Build and run

Run the command: `pnpm run build` and then: `pnpm run start`

**Note:** Run in http mode

---

## License: MIT