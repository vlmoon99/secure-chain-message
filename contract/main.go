package main

import (
	"sync"

	"github.com/vlmoon99/near-sdk-go/collections"
	contractBuilder "github.com/vlmoon99/near-sdk-go/contract"
	"github.com/vlmoon99/near-sdk-go/env"
)

var (
	contractInstance interface{}
	contractOnce     sync.Once
)

type SecureChainMessageState struct {
	messages *collections.UnorderedMap[string, string]
}

func NewSecureChainMessageState() *SecureChainMessageState {
	return &SecureChainMessageState{
		messages: collections.NewUnorderedMap[string, string]("secure_chain_msg"),
	}
}

type SecureChainMessageContract struct {
	state *SecureChainMessageState
}

func NewSecureChainMessageContract() *SecureChainMessageContract {
	return &SecureChainMessageContract{
		state: NewSecureChainMessageState(),
	}
}

func GetContract() interface{} {
	contractOnce.Do(func() {
		if contractInstance == nil {
			contractInstance = NewSecureChainMessageContract()
		}
	})
	return contractInstance
}

const (
	KeyInput     = "key"
	MessageInput = "msg"
)

//go:export CreateMsg
func CreateMsg() {
	contractBuilder.HandleClientJSONInput(func(input *contractBuilder.ContractInput) error {
		msg, err := input.JSON.GetString(MessageInput)
		if err != nil {
			return err
		}

		key, err := input.JSON.GetString(KeyInput)
		if err != nil {
			return err
		}

		contract := GetContract().(*SecureChainMessageContract)
		env.LogString("Creating message with key: " + key + " and message: " + msg)
		if err := contract.state.messages.Insert(key, msg); err != nil {
			return err
		}

		contractBuilder.ReturnValue("Msg was created successfully")
		return nil
	})
}

//go:export GetMsg
func GetMsg() {
	contractBuilder.HandleClientJSONInput(func(input *contractBuilder.ContractInput) error {
		key, err := input.JSON.GetString(KeyInput)
		if err != nil {
			return err
		}

		contract := GetContract().(*SecureChainMessageContract)

		msg, err := contract.state.messages.Get(key)
		if err != nil {
			msg = "Error getting message: " + err.Error()
		}
		env.LogString("Retrieving message with key: " + key + " - Message: " + msg)

		contractBuilder.ReturnValue(msg)
		return nil
	})
}
