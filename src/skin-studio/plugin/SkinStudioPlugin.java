package com.skinstudio.plugin;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mojang.authlib.GameProfile;
import com.mojang.authlib.properties.Property;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * SkinStudioPlugin
 * Official Minecraft Java Server Plugin for Skin Studio Platform.
 * Supports Paper, Spigot, and Purpur (1.16 - 1.20+).
 */
public class SkinStudioPlugin extends JavaPlugin implements CommandExecutor {

    private String apiUrl;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        this.apiUrl = getConfig().getString("api-url", "https://foraiiguesslol-crypto.github.io/testgameiguess/api/skins");

        getCommand("skin").setExecutor(this);
        getLogger().info("SkinStudioPlugin enabled successfully! Connected to: " + apiUrl);
    }

    @Override
    public void onDisable() {
        getLogger().info("SkinStudioPlugin disabled.");
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "This command can only be executed by in-game players.");
            return true;
        }

        Player player = (Player) sender;

        if (args.length == 0) {
            sendHelp(player);
            return true;
        }

        String sub = args[0].toLowerCase();

        if (sub.equals("help")) {
            sendHelp(player);
            return true;
        }

        if (sub.equals("reset")) {
            resetSkin(player);
            return true;
        }

        String skinId = sub.equals("set") && args.length > 1 ? args[1] : args[0];
        applySkinFromStudio(player, skinId);
        return true;
    }

    private void sendHelp(Player player) {
        player.sendMessage(ChatColor.GOLD + "=== " + ChatColor.YELLOW + "Skin Studio Integration" + ChatColor.GOLD + " ===");
        player.sendMessage(ChatColor.AQUA + "/skin <id>" + ChatColor.GRAY + " - Apply skin from Skin Studio gallery");
        player.sendMessage(ChatColor.AQUA + "/skin set <id>" + ChatColor.GRAY + " - Set skin permanently");
        player.sendMessage(ChatColor.AQUA + "/skin reset" + ChatColor.GRAY + " - Reset to default skin");
    }

    private void applySkinFromStudio(Player player, String skinId) {
        player.sendMessage(ChatColor.YELLOW + "Fetching skin " + ChatColor.GOLD + skinId + ChatColor.YELLOW + " from Skin Studio...");

        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            try {
                URL url = new URL(apiUrl + "/" + skinId + ".json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "Minecraft-SkinStudioPlugin/1.0");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                if (conn.getResponseCode() != 200) {
                    player.sendMessage(ChatColor.RED + "Skin ID '" + skinId + "' not found on Skin Studio.");
                    return;
                }

                InputStreamReader reader = new InputStreamReader(conn.getInputStream());
                JsonObject json = JsonParser.parseReader(reader).getAsJsonObject();
                reader.close();

                String textureValue = json.has("textureValue") ? json.get("textureValue").getAsString() : "";
                String signature = json.has("signature") ? json.get("signature").getAsString() : "";
                String skinTitle = json.has("title") ? json.get("title").getAsString() : skinId;

                if (textureValue.isEmpty()) {
                    player.sendMessage(ChatColor.RED + "Invalid texture payload received from API.");
                    return;
                }

                // Apply skin texture to GameProfile
                Bukkit.getScheduler().runTask(this, () -> {
                    try {
                        Object nmsPlayer = player.getClass().getMethod("getHandle").invoke(player);
                        GameProfile profile = (GameProfile) nmsPlayer.getClass().getMethod("getProfile").invoke(nmsPlayer);

                        profile.getProperties().removeAll("textures");
                        profile.getProperties().put("textures", new Property("textures", textureValue, signature));

                        // Refresh player visibility for surrounding players
                        for (Player online : Bukkit.getOnlinePlayers()) {
                            online.hidePlayer(this, player);
                            online.showPlayer(this, player);
                        }

                        player.sendMessage(ChatColor.GREEN + "Successfully equipped skin: " + ChatColor.GOLD + skinTitle + ChatColor.GREEN + "!");
                    } catch (Exception ex) {
                        player.sendMessage(ChatColor.RED + "Failed to refresh skin: " + ex.getMessage());
                    }
                });

            } catch (Exception e) {
                player.sendMessage(ChatColor.RED + "Error connecting to Skin Studio API: " + e.getMessage());
            }
        });
    }

    private void resetSkin(Player player) {
        player.sendMessage(ChatColor.YELLOW + "Resetting skin to default...");
        try {
            Object nmsPlayer = player.getClass().getMethod("getHandle").invoke(player);
            GameProfile profile = (GameProfile) nmsPlayer.getClass().getMethod("getProfile").invoke(nmsPlayer);
            profile.getProperties().removeAll("textures");

            for (Player online : Bukkit.getOnlinePlayers()) {
                online.hidePlayer(this, player);
                online.showPlayer(this, player);
            }
            player.sendMessage(ChatColor.GREEN + "Skin reset complete!");
        } catch (Exception e) {
            player.sendMessage(ChatColor.RED + "Failed to reset skin: " + e.getMessage());
        }
    }
}
