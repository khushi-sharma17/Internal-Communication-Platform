<?php

namespace app\services;

use GuzzleHttp\Client;
use RuntimeException;

class AiService
{
    private Client $client;
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = $_ENV['AI_API_KEY'] ?? '';
        $this->model = $_ENV['AI_MODEL'] ?? 'gpt-4o-mini';

        if ($this->apiKey === '') {
            throw new RuntimeException('AI_API_KEY is not configured.');
        }

        $this->client = new Client([
            'base_uri' => 'https://api.groq.com/openai/v1/',
            'timeout' => 30,
        ]);
    }

    public function generate(string $systemPrompt, string $userPrompt): string
    {
        $response = $this->client->post('chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $userPrompt,
                    ],
                ],
                'temperature' => 0.2,
            ],
        ]);

        $data = json_decode(
            (string) $response->getBody(),
            true
        );

        $content = $data['choices'][0]['message']['content'] ?? null;

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException('AI provider returned an empty response.');
        }

        return trim($content);
    }
}