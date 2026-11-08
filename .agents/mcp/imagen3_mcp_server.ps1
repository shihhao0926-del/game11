# Google Imagen 3.0 (imagen-3.0-generate-002) Model Context Protocol (MCP) Stdio Server
# 支援透過 Google Gemini API 呼叫 Imagen 3.0 生成圖片並直接存入專案資料夾

[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Send-McpResponse($id, $result) {
    $resp = @{
        jsonrpc = "2.0"
        id      = $id
        result  = $result
    } | ConvertTo-Json -Depth 10 -Compress
    [Console]::Out.WriteLine($resp)
    [Console]::Out.Flush()
}

function Send-McpError($id, [int]$code, [string]$message) {
    $resp = @{
        jsonrpc = "2.0"
        id      = $id
        error   = @{
            code    = $code
            message = $message
        }
    } | ConvertTo-Json -Depth 6 -Compress
    [Console]::Out.WriteLine($resp)
    [Console]::Out.Flush()
}

while ($null -ne ($line = [Console]::In.ReadLine())) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $req = $line | ConvertFrom-Json
    } catch {
        continue
    }

    $method = $req.method
    $id     = $req.id

    if ($method -eq "initialize") {
        Send-McpResponse $id @{
            protocolVersion = "2024-11-05"
            capabilities    = @{
                tools = @{}
            }
            serverInfo      = @{
                name    = "google-imagen-3-mcp"
                version = "1.0.0"
            }
        }
    }
    elseif ($method -eq "notifications/initialized") {
        # No response needed for notification
    }
    elseif ($method -eq "tools/list") {
        Send-McpResponse $id @{
            tools = @(
                @{
                    name        = "generate_image_imagen3"
                    description = "使用 Google Imagen 3.0 (imagen-3.0-generate-002) 生成遊戲角色、卡牌或攻擊特效 PNG 圖檔並直接存入專案資料夾。"
                    inputSchema = @{
                        type       = "object"
                        properties = @{
                            prompt      = @{
                                type        = "string"
                                description = "英文或中文生圖提示詞 (Prompt)"
                            }
                            output_path = @{
                                type        = "string"
                                description = "輸出的相對或絕對路徑，例如 assets/card_effect.png"
                            }
                            aspect_ratio = @{
                                type        = "string"
                                description = "長寬比：1:1, 4:3, 3:4, 16:9, 9:16（預設 1:1）"
                            }
                        }
                        required   = @("prompt", "output_path")
                    }
                }
            )
        }
    }
    elseif ($method -eq "tools/call") {
        $toolName = $req.params.name
        $args     = $req.params.arguments

        if ($toolName -eq "generate_image_imagen3") {
            $prompt      = [string]$args.prompt
            $outputPath  = [string]$args.output_path
            $aspectRatio = if ($args.aspect_ratio) { [string]$args.aspect_ratio } else { "1:1" }
            $apiKey      = $env:GEMINI_API_KEY

            if ([string]::IsNullOrWhiteSpace($apiKey)) {
                Send-McpResponse $id @{
                    content = @(
                        @{
                            type = "text"
                            text = "尚未設定 GEMINI_API_KEY 環境變數。請在 .agents/mcp_config.json 的 env 中填入您的 Google AI Studio API Key，即可直接呼叫 imagen-3.0-generate-002 生成圖片！"
                        }
                    )
                    isError = $true
                }
                continue
            }

            try {
                $uri = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=$apiKey"
                $bodyObj = @{
                    instances  = @(@{ prompt = $prompt })
                    parameters = @{
                        sampleCount = 1
                        aspectRatio = $aspectRatio
                        outputOptions = @{ mimeType = "image/png" }
                    }
                }
                $jsonBody = $bodyObj | ConvertTo-Json -Depth 6
                $apiResp  = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody))
                $b64      = $apiResp.predictions[0].bytesBase64Encoded

                $fullOut = if ([System.IO.Path]::IsPathRooted($outputPath)) { $outputPath } else { Join-Path (Get-Location).Path $outputPath }
                $parentDir = Split-Path -Parent $fullOut
                if (!(Test-Path $parentDir)) {
                    New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
                }
                [System.IO.File]::WriteAllBytes($fullOut, [Convert]::FromBase64String($b64))

                Send-McpResponse $id @{
                    content = @(
                        @{
                            type = "text"
                            text = "✅ 已成功透過 Google Imagen 3.0 生成圖片並儲存至：$fullOut"
                        }
                    )
                }
            } catch {
                Send-McpResponse $id @{
                    content = @(
                        @{
                            type = "text"
                            text = "呼叫 Google Imagen 3.0 API 失敗：$($_.Exception.Message)"
                        }
                    )
                    isError = $true
                }
            }
        } else {
            Send-McpError $id -32601 "Unknown tool: $toolName"
        }
    }
}

