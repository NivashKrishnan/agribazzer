import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _selectedIndex = 4; // Profile tab selected (index 4)
  bool _isDarkMode = false;

  // Persistent User State
  String _name = 'Ramesh Kumar';
  String _phone = '+91 98765 43210';
  String _location = 'Thanjavur, Tamil Nadu';
  String _role = 'farmer'; // 'farmer' or 'buyer'
  String _farmSize = '5.2 Acres';
  String _mainCrop = 'Paddy';
  String _language = 'English';

  // Expansion States
  bool _farmExpanded = true;
  bool _accountExpanded = true;

  // Settings State
  bool _notiPush = true;
  bool _notiWeather = true;
  bool _notiPrice = true;
  bool _notiBuyer = true;

  bool _privPublic = true;
  bool _privSharing = true;
  bool _priv2FA = false;

  void _showDeleteDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Color(0xFFD32F2F)),
              SizedBox(width: 10),
              Text('Delete Account?'),
            ],
          ),
          content: const Text(
            'Are you sure you want to permanently delete your AGRIBAZZER account and stored data? This action cannot be undone.',
            style: TextStyle(fontSize: 13.5, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD32F2F),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Account deleted successfully')),
                );
              },
              child: const Text('Delete Permanently',
                  style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  // 1. EDIT PROFILE FORM SHEET
  void _openEditProfileSheet() {
    final nameCtrl = TextEditingController(text: _name);
    final phoneCtrl = TextEditingController(text: _phone);
    final locCtrl = TextEditingController(text: _location);
    final farmCtrl = TextEditingController(text: _farmSize);
    final cropCtrl = TextEditingController(text: _mainCrop);
    String selectedRole = _role;
    String? errorText;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (BuildContext ctx) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Edit Profile',
                          style: TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B5E20),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const Divider(),
                    if (errorText != null)
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEBEE),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFFFCDD2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: Color(0xFFD32F2F), size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                errorText!,
                                style: const TextStyle(
                                  color: Color(0xFFD32F2F),
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Full Name *',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: phoneCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number *',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: locCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Location *',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedRole,
                      decoration: const InputDecoration(
                        labelText: 'Account Mode',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(
                            value: 'farmer', child: Text('🌾 Farmer Mode')),
                        DropdownMenuItem(
                            value: 'buyer', child: Text('🏪 Buyer Mode')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() => selectedRole = val);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: farmCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Farm Size',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: cropCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Main Crop',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1B5E20),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              final name = nameCtrl.text.trim();
                              final phone = phoneCtrl.text.trim();
                              final loc = locCtrl.text.trim();

                              if (name.isEmpty) {
                                setModalState(() => errorText =
                                    'Full name cannot be empty');
                                return;
                              }
                              if (phone.isEmpty) {
                                setModalState(() => errorText =
                                    'Phone number cannot be empty');
                                return;
                              }
                              final digitsOnly =
                                  phone.replaceAll(RegExp(r'\D'), '');
                              if (digitsOnly.length < 10) {
                                setModalState(() => errorText =
                                    'Please enter a valid 10-digit phone number');
                                return;
                              }
                              if (loc.isEmpty) {
                                setModalState(() =>
                                    errorText = 'Location cannot be empty');
                                return;
                              }

                              setState(() {
                                _name = name;
                                _phone = phone;
                                _location = loc;
                                _role = selectedRole;
                                _farmSize = farmCtrl.text.trim().isNotEmpty
                                    ? farmCtrl.text.trim()
                                    : '5.2 Acres';
                                _mainCrop = cropCtrl.text.trim().isNotEmpty
                                    ? cropCtrl.text.trim()
                                    : 'Paddy';
                              });

                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Profile updated successfully.'),
                                  backgroundColor: Color(0xFF1B5E20),
                                ),
                              );
                            },
                            child: const Text('Save Changes',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // 2. NOTIFICATIONS SETTINGS SHEET
  void _openNotificationsSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🔔 Notifications Settings',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B5E20))),
                  const Divider(),
                  SwitchListTile(
                    title: const Text('Push Notifications'),
                    subtitle: const Text('Order & account alerts'),
                    value: _notiPush,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _notiPush = v);
                      setModalState(() {});
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Weather Alerts'),
                    subtitle: const Text('Rain, frost & spray warnings'),
                    value: _notiWeather,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _notiWeather = v);
                      setModalState(() {});
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Price & Market Alerts'),
                    subtitle: const Text('Mandi price fluctuation updates'),
                    value: _notiPrice,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _notiPrice = v);
                      setModalState(() {});
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Buyer Match Alerts'),
                    subtitle: const Text('AI buyer instant matches'),
                    value: _notiBuyer,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _notiBuyer = v);
                      setModalState(() {});
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // 3. LANGUAGE SHEET
  void _openLanguageSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🌐 Select Language',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B5E20))),
                  const Divider(),
                  RadioListTile<String>(
                    title: const Text('English'),
                    value: 'English',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('தமிழ் (Tamil)'),
                    value: 'Tamil',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('हिन्दी (Hindi)'),
                    value: 'Hindi',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('తెలుగు (Telugu)'),
                    value: 'Telugu',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('கன்னட (Kannada)'),
                    value: 'Kannada',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('മലയാളം (Malayalam)'),
                    value: 'Malayalam',
                    groupValue: _language,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _language = v);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Language set to $v')),
                        );
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // 4. PRIVACY SHEET
  void _openPrivacySheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🔒 Privacy & Security',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B5E20))),
                  const Divider(),
                  SwitchListTile(
                    title: const Text('Public Profile'),
                    subtitle: const Text('Allow buyers to discover profile'),
                    value: _privPublic,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _privPublic = v);
                      setModalState(() {});
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Data Sharing with Agri-Partners'),
                    subtitle: const Text('Share crop health data'),
                    value: _privSharing,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _privSharing = v);
                      setModalState(() {});
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Two-Factor Authentication'),
                    subtitle: const Text('SMS OTP on login'),
                    value: _priv2FA,
                    activeColor: const Color(0xFF1B5E20),
                    onChanged: (v) {
                      setState(() => _priv2FA = v);
                      setModalState(() {});
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // 5. HELP & SUPPORT SHEET
  void _openHelpSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('❓ Help & Support',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B5E20))),
              const Divider(),
              const Text('Frequently Asked Questions',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              const ExpansionTile(
                title: Text('How do I sell my produce?'),
                children: [
                  Padding(
                    padding: EdgeInsets.all(12.0),
                    child: Text(
                        'Go to the Sell tab, click Publish Produce, and enter your harvest details.'),
                  )
                ],
              ),
              const ExpansionTile(
                title: Text('Is payment guaranteed?'),
                children: [
                  Padding(
                    padding: EdgeInsets.all(12.0),
                    child: Text(
                        'Yes, buyer payments are held safely in escrow until you confirm delivery.'),
                  )
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B5E20),
                  ),
                  icon: const Icon(Icons.call, color: Colors.white),
                  label: const Text('Call Toll-Free Support (1800-AGRI-HELP)',
                      style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Calling 1800-AGRI-HELP...')),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8F5E9),

      // HEADER
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: const Color(0xFF1B5E20),
          elevation: 0,
          automaticallyImplyLeading: false,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
          ),
          title: const Text(
            'Profile',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 20,
              letterSpacing: 0.2,
            ),
          ),
          actions: [
            IconButton(
              icon: Icon(
                _isDarkMode ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                color: Colors.amber,
                size: 22,
              ),
              onPressed: () {
                setState(() {
                  _isDarkMode = !_isDarkMode;
                });
              },
            ),
            const SizedBox(width: 8),
          ],
        ),
      ),

      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 110.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // PROFILE CARD
            Card(
              elevation: 2,
              shadowColor: Colors.black12,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 32,
                          backgroundColor: const Color(0xFFC8E6C9),
                          child: const Icon(
                            Icons.person_rounded,
                            color: Color(0xFF1B5E20),
                            size: 36,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _name,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B5E20),
                                ),
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE8F5E9),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(
                                          Icons.verified_rounded,
                                          color: Color(0xFF2E7D32),
                                          size: 13,
                                        ),
                                        SizedBox(width: 4),
                                        Text(
                                          'Verified Farmer',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF2E7D32),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$_phone · $_location',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: Colors.black54,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1B5E20),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _role == 'farmer'
                                ? '🌾 Farmer Mode — Active'
                                : '🏪 Buyer Mode — Active',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF8E1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFFFE082)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.star_rounded,
                                  color: Colors.amber, size: 14),
                              SizedBox(width: 3),
                              Text(
                                '4.8 Rating',
                                style: TextStyle(
                                  color: Color(0xFFB78103),
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFC8E6C9)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.landscape_rounded,
                                  color: Color(0xFF2E7D32), size: 14),
                              const SizedBox(width: 4),
                              Text(
                                '🌱 $_farmSize',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B5E20),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFC8E6C9)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.grass_rounded,
                                  color: Color(0xFF2E7D32), size: 14),
                              const SizedBox(width: 4),
                              Text(
                                '🌾 Main Crop: $_mainCrop',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B5E20),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        // Functional Edit Profile Button
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _openEditProfileSheet,
                            icon: const Icon(Icons.edit_outlined, size: 16),
                            label: const Text(
                              'Edit Profile',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1B5E20),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Switch Mode Button
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              setState(() {
                                _role = _role == 'farmer' ? 'buyer' : 'farmer';
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text('Switched to $_role mode')),
                              );
                            },
                            icon: const Icon(Icons.swap_horiz_rounded,
                                size: 16, color: Color(0xFF1B5E20)),
                            label: const Text(
                              'Switch Mode',
                              style: TextStyle(
                                color: Color(0xFF1B5E20),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(
                                  color: Color(0xFF1B5E20), width: 1.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            _buildSectionCard([
              _buildDetailedListTile(
                icon: Icons.eco_outlined,
                title: '🌾 My Farms',
                subtitle: 'Manage your farm details',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('My Farms page opened')),
                  );
                },
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.storefront_outlined,
                title: '🏪 My Business',
                subtitle: 'Manage your agricultural business',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('My Business page opened')),
                  );
                },
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.location_on_outlined,
                title: '📍 Farm Locations',
                subtitle: 'Manage farm locations',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Farm Locations page opened')),
                  );
                },
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.inventory_2_outlined,
                title: '📦 My Products',
                subtitle: 'Manage products you want to sell',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('My Products page opened')),
                  );
                },
              ),
            ]),

            const SizedBox(height: 14),

            _buildSectionCard([
              _buildDetailedListTile(
                icon: Icons.notifications_none_rounded,
                title: '🔔 Notifications',
                subtitle: 'Manage alerts and updates',
                onTap: _openNotificationsSheet,
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.language_rounded,
                title: '🌐 Language',
                subtitle: 'English / Tamil / Thanglish',
                onTap: _openLanguageSheet,
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.security_rounded,
                title: '🔒 Privacy & Security',
                subtitle: 'Manage privacy and security',
                onTap: _openPrivacySheet,
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.help_outline_rounded,
                title: '❓ Help & Support',
                subtitle: 'Get help with AGRIBAZZER',
                onTap: _openHelpSheet,
              ),
              _buildDivider(),
              _buildDetailedListTile(
                icon: Icons.settings_outlined,
                title: '⚙️ App Settings',
                subtitle: 'Manage application preferences',
                onTap: _openNotificationsSheet,
              ),
            ]),

            const SizedBox(height: 24),

            // Logout & Delete Account
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.logout_rounded,
                    size: 18, color: Color(0xFF1B5E20)),
                label: const Text(
                  'Logout',
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B5E20),
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _showDeleteDialog,
                icon: const Icon(Icons.close_rounded,
                    size: 18, color: Color(0xFFD32F2F)),
                label: const Text(
                  'Delete Account',
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD32F2F),
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFEBEE),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            const Center(
              child: Text(
                'AGRIBAZZER Mobile • v1.0.0',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),

      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 60.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            FloatingActionButton.extended(
              heroTag: 'scanCropFab',
              onPressed: () {},
              backgroundColor: const Color(0xFF2E7D32),
              elevation: 4,
              icon: const Icon(Icons.qr_code_scanner_rounded,
                  color: Colors.white),
              label: const Text(
                'Scan Crop',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(width: 10),
            FloatingActionButton.extended(
              heroTag: 'agriBotFab',
              onPressed: () {},
              backgroundColor: const Color(0xFF1B5E20),
              elevation: 4,
              icon: const Icon(Icons.smart_toy_rounded, color: Colors.white),
              label: const Text(
                'AgriBot',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF1B5E20),
        unselectedItemColor: Colors.grey.shade600,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.show_chart_rounded),
            activeIcon: Icon(Icons.show_chart_rounded),
            label: 'Market',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart_outlined),
            activeIcon: Icon(Icons.shopping_cart_rounded),
            label: 'Sell',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2_outlined),
            activeIcon: Icon(Icons.inventory_2_rounded),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard(List<Widget> children) {
    return Card(
      elevation: 1,
      shadowColor: Colors.black12,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDivider() {
    return const Divider(height: 1, thickness: 0.6, color: Color(0xFFE0E0E0));
  }

  Widget _buildDetailedListTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: const Color(0xFF1B5E20), size: 22),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1B5E20),
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 11.5,
          color: Colors.black54,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded,
          color: Colors.grey, size: 22),
      onTap: onTap,
    );
  }
}

