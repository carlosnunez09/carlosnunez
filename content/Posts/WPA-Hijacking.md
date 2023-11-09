---
title: "WPA Highjacking (For Educational Purposes Only)"
date: 2023-10-20

author: "me"
tag: "hacking"
draft: false 
---

In this post im going to be exploring and illustrating the process of WPA hijacking

## Getting Started

Before embarking on our journey into the fascinating world of WPA hijacking, there are a few crucial prerequisites to consider. Depending on your preferred setup, you can either install Linux or set up a virtual machine (VM). Although we recommend Kali Linux for the best experience, it's not mandatory.

### Installing Linux

If you choose to install Linux, we suggest using Kali Linux 2023.2, as it provides an optimized environment for our purpose. You can download it from the official Kali Linux website [here](https://www.kali.org/).

### OR

### Setting Up a Virtual Machine

If booting a live image is not an option for you, a virtual machine is an alternative solution. We recommend using VirtualBox. Here's a step-by-step guide:

1. **Install VirtualBox**: Begin by installing VirtualBox on your system.

2. **Download the Kali Linux Prebuilt Virtual Machine**: Visit the official Kali Linux website [here](https://www.kali.org/) and download the prebuilt VirtualBox machine.

3. **Add the VM to VirtualBox**: Import the downloaded VM into VirtualBox.

4. **Connect Your USB Network Adapter**: Please note that using a VM for this purpose requires a USB network adapter. If you can live boot, you can skip this section.

5. **Booting the VM**: Once you've added the VM and connected your USB adapter, start the VM. To verify that your adapter is working correctly, open a terminal in Kali Linux and run the command `ip a`.

With your setup in place, you're now ready to begin exploring WPA hijacking. First, let's ensure that your Linux system is up-to-date. Open a terminal and execute the following commands:

```bash
sudo apt update
sudo apt upgrade
```

### Starting with Your Wireless Interface

To ensure that your setup is ready for WPA hijacking and to determine whether you need a wireless adapter, follow these steps:

1. Open a terminal in Kali Linux.

2. Install aircrack-ng ```sudo apt install aircrack-ng``` (kali come preinstalled with aircrack-ng) this will install a list of ng packages.

3. Run the following command to list available wireless interfaces:

```bash
sudo airmon-ng
```

4. now we will run the flowing command to start monitor mode use the name of your wireless interface:

```bash
sudo airmon-ng start <your_Wireless_Interface>
```

Note your wireless interface's name (usually starts with "wlan"). If you see your wireless interface listed, and it matches the one you've connected to your USB adapter, then you're all set. However, please be aware that monitor mode may not work with certain built-in wireless chips on your computer or laptop. If it's not listed or monitor mode is not functioning as expected, you may need a compatible USB wireless adapter.

5. Now that you've started monitor mode, you can use the following command to confirm that it's working correctly:

```bash
sudo iwconfig
```
you made it this far I will explain the 3 componets of good WPA hijaking

## WPA Hijacking Components

If you've made it this far, I'll explain the three key components of successful WPA hijacking.

| Component         | Description                                                                                                             |
|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| **Deauthentication** | Deauthentication attacks disrupt the Wi-Fi connection between a client device and the access point by sending deauthentication packets. This can force the client to disconnect and potentially reconnect, enabling the attacker to capture handshake packets. |
| **Capturing**       | Packet capturing involves intercepting and collecting network data packets, particularly the four-way handshake packets exchanged between a client and the access point during the connection setup. These packets contain the necessary information for a potential password recovery attempt. |
| **Hashing**         | Hashing refers to the process of taking the captured four-way handshake packets and attempting to crack the Wi-Fi password. Tools like Aircrack-ng and Hashcat are commonly used for this purpose. The goal is to derive the original pre-shared key (PSK) used for WPA/WPA2 security. |

These three components are central to WPA hijacking and are typically executed in a systematic manner to gain unauthorized access to a secured Wi-Fi network.

## Working with Bettercap

Now that you understand the components, let's explore how to use Bettercap for deauthentication and packet capturing. We'll use Aircrack-ng for the hashing part.

To install Bettercap, use the following commands:

```bash
sudo apt update
sudo apt install bettercap
```
Since we're downloading tools, let's also install Aircrack-ng. It comes preinstalled on Kali Linux, but you can ensure it's up-to-date with the following:

```bash
sudo apt update
sudo apt install aircrack-ng
```

To start up bettercap we will use your interface you can use the following command to get you interface:

 ```bash 
sudo iwconfig
```

then we will start the bettecap terminal:

 ```bash 
sudo bettercap -iface <your interface>
```
this is will place us in the bettercap terminal


