const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { itParam } = require("mocha-param");

describe("Tokenizer Contracts", () => {
  const tokenizerFixtures = async () => {
    const fee = ethers.utils.parseEther("0.1");
    const rewardsAmount = ethers.utils.parseEther("1");
    const TokenizerErc721 = await ethers.getContractFactory("TokenizerErc721");
    const tokenizerErc721 = await TokenizerErc721.deploy(
      "Tokenizers",
      "TKZ",
      fee,
      rewardsAmount
    );
    const TokenizerErc20 = await ethers.getContractFactory("TokenizerErc20");
    const tokenizerErc20 = await TokenizerErc20.deploy(
      "Tokies",
      "TKI",
      tokenizerErc721.address
    );
    return { tokenizerErc721, tokenizerErc20 };
  };
  describe("Tokenizer ERC721 Contract", () => {
    it("Deploys ERC721 Contract", async () => {
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(tokenizerErc721.address.length).to.equal(42);
    });
    it("Sets global admin variabl to deployer address", async () => {
      const deployer = await ethers.getSigner();
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc721.s_admin()).to.equal(deployer.address);
    });
    it("Sets the name of NFT collection", async () => {
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc721.name()).to.equal("Tokenizers");
    });
    it("Sets the symbol of NFT collection", async () => {
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc721.symbol()).to.equal("TKZ");
    });
    it("Sets the symbol of NFT collection", async () => {
      const fee = ethers.utils.parseEther("0.1");
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc721.s_fee()).to.equal(fee);
    });
    it("Sets the rewards amonut global variable", async () => {
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc721.s_rewardsAmount()).to.equal(
        ethers.utils.parseEther("1")
      );
    });
    itParam(
      "Fee change event is emitted with old fee amount ${value.oldAmount} and new fee amount ${value.newAmount}",
      [
        {
          oldAmount: 0.1,
          newAmount: 0.3,
        },
        {
          oldAmount: 0.1,
          newAmount: 100,
        },
        {
          oldAmount: 0.1,
          newAmount: 0.222,
        },
      ],
      async (value) => {
        const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
        await expect(
          tokenizerErc721.changeFee(
            ethers.utils.parseEther(value.newAmount.toString())
          )
        )
          .to.emit(tokenizerErc721, "FeeChanged")
          .withArgs(
            ethers.utils.parseEther(value.oldAmount.toString()),
            ethers.utils.parseEther(value.newAmount.toString())
          );
      }
    );
    itParam(
      "Admin address changed global fee variable to ${value} ETH",
      [1, 0.5, 0.6, 0.999, 10, 2, 4, 100],
      async (value) => {
        const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
        await tokenizerErc721.changeFee(
          ethers.utils.parseEther(value.toString())
        );
        expect(await tokenizerErc721.s_fee()).to.equal(
          ethers.utils.parseEther(value.toString())
        );
      }
    );
    itParam(
      "Non-admin address fails to change global fee variable to ${value} ETH",
      [1, 0.5, 0.6, 0.999, 10, 2, 4, 100],
      async (value) => {
        const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
        const [, randSigner] = await ethers.getSigners();
        await expect(
          tokenizerErc721
            .connect(randSigner)
            .changeFee(ethers.utils.parseEther(value.toString()))
        ).to.be.revertedWith("changeFee: Only Admin");
      }
    );
    it("Mints rewards when collectable is created", async () => {
      const mockTokenURI =
        "https://pinata.gateway/I-dont-remember-the-url-scheme";
      const fee = ethers.utils.parseEther("0.1");
      const rewardsAmount = ethers.utils.parseEther("1");
      const signer = await ethers.getSigner();
      const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
        tokenizerFixtures
      );
      await tokenizerErc721.mintCollectable(
        mockTokenURI,
        tokenizerErc20.address,
        {
          value: fee,
        }
      );
      expect(await tokenizerErc20.balanceOf(signer.address)).to.equal(
        rewardsAmount
      );
    });
    itParam(
      "Mints collectable and sets it's token URI to: ${value}",
      [
        "http://testiusdhfhsadfh",
        "ouashdfoasdhf",
        "http://ipfs/paoisdhfasidfhoapsdhfhisdf",
      ],
      async (value) => {
        const fee = ethers.utils.parseEther("0.1");
        const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
          tokenizerFixtures
        );
        await tokenizerErc721.mintCollectable(value, tokenizerErc20.address, {
          value: fee,
        });
      }
    );
    itParam(
      "Fails to mint collectable with incorrect fee amount of ${value} ETH",
      [0.11, 1, 22.302, 3, 4, 0.2, 0.12],
      async (value) => {
        const incorrectFeeAmount = ethers.utils.parseEther(value.toString());
        const mockTokenURI =
          "http://pinata.gateway/I-dont-remember-the-pinata-urls";
        const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
          tokenizerFixtures
        );
        await expect(
          tokenizerErc721.mintCollectable(
            mockTokenURI,
            tokenizerErc20.address,
            {
              value: incorrectFeeAmount,
            }
          )
        ).to.be.revertedWith("mintCollectable: Incorrect Fee");
      }
    );
    itParam(
      "Changes the rewards amount from ${value.oldAmount} to ${value.newAmount}",
      [
        { oldAmount: 1, newAmount: 0.1 },
        { oldAmount: 1, newAmount: 20 },
        { oldAmount: 1, newAmount: 100.234 },
      ],
      async (value) => {
        const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
        await tokenizerErc721.changeRewardsAmount(
          ethers.utils.parseEther(value.newAmount.toString())
        );
        expect(await tokenizerErc721.s_rewardsAmount()).to.equal(
          ethers.utils.parseEther(value.newAmount.toString())
        );
      }
    );
    it("Non-admin account cannot change the rewards amount global variable", async () => {
      const [, randSigner] = await ethers.getSigners();
      const newRewardsAmount = ethers.utils.parseEther("100");
      const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
      await expect(
        tokenizerErc721
          .connect(randSigner)
          .changeRewardsAmount(newRewardsAmount)
      ).to.be.revertedWith("changeRewardsAmount: Only Admin");
    });

    itParam(
      "Emits Change rewards amount from ${value.oldAmount} to ${value.newAmount}",
      [
        { oldAmount: 1, newAmount: 0.92 },
        { oldAmount: 1, newAmount: 3.1421 },
        { oldAmount: 1, newAmount: 22 },
      ],
      async (value) => {
        const { tokenizerErc721 } = await loadFixture(tokenizerFixtures);
        await expect(
          tokenizerErc721.changeRewardsAmount(
            ethers.utils.parseEther(value.newAmount.toString())
          )
        )
          .to.emit(tokenizerErc721, "RewardsAmountChanged")
          .withArgs(
            ethers.utils.parseEther(value.oldAmount.toString()),
            ethers.utils.parseEther(value.newAmount.toString())
          );
      }
    );
    it("Collectable minted event is emitted and displays the recipient address", async () => {
      const fee = ethers.utils.parseEther("0.1");
      const mockTokenURI =
        "http://pinata.gateway/I-dont-remember-the-pinata-urls";
      const signer = await ethers.getSigner();
      const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
        tokenizerFixtures
      );
      await expect(
        tokenizerErc721.mintCollectable(mockTokenURI, tokenizerErc20.address, {
          value: fee,
        })
      )
        .to.emit(tokenizerErc721, "NftMinted")
        .withArgs(signer.address);
    });
  });
  describe("Tokenizer ERC20 Contract", () => {
    it("Deploys ERC20 Contract", async () => {
      const { tokenizerErc20 } = await loadFixture(tokenizerFixtures);
      expect(tokenizerErc20.address.length).to.equal(42);
    });
    it("Sets global admin variabl to deployer address", async () => {
      const deployer = await ethers.getSigner();
      const { tokenizerErc20 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc20.s_admin()).to.equal(deployer.address);
    });
    it("Sets the name of the ERC20 token", async () => {
      const { tokenizerErc20 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc20.name()).to.equal("Tokies");
    });
    it("Sets the symbol of the ERC20 token", async () => {
      const { tokenizerErc20 } = await loadFixture(tokenizerFixtures);
      expect(await tokenizerErc20.symbol()).to.equal("TKI");
    });
    it("Sets the global tokenizerErc721 contract address", async () => {
      const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
        tokenizerFixtures
      );
      expect(await tokenizerErc20.s_tokenizerErc721()).to.equal(
        tokenizerErc721.address
      );
    });
    it("Emits tokens minted event when rewards are issued", async () => {
      const mockTokenURI =
        "https://pinata.gateway/I-dont-remember-the-url-scheme";
      const fee = ethers.utils.parseEther("0.1");
      const signer = await ethers.getSigner();
      const { tokenizerErc20, tokenizerErc721 } = await loadFixture(
        tokenizerFixtures
      );
      const rewardsAmount = await tokenizerErc721.s_rewardsAmount();
      await expect(
        tokenizerErc721.mintCollectable(mockTokenURI, tokenizerErc20.address, {
          value: fee,
        })
      )
        .to.emit(tokenizerErc20, "TokensMinted")
        .withArgs(signer.address, rewardsAmount);
    });
  });
});
