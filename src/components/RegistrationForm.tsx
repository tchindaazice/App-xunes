import React, { useState } from 'react';
import { AFRICAN_COUNTRIES } from '../data/africanCountries';
import { AfricanCountry, CommunicationType, DeviceInfo } from '../types/vpn';
import { StorageService, getSimulatedDeviceInfo } from '../services/storageService';
import {
  Shield,
  Send,
  Phone,
  User,
  KeyRound,
  Globe,
  ChevronDown,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search
} from 'lucide-react';

interface RegistrationFormProps {
  onRequestSubmitted: (requestId: string) => void;
  onDirectTokenLogin: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRequestSubmitted,
  onDirectTokenLogin
}) => {
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry>(
    AFRICAN_COUNTRIES.find((c) => c.code === 'CM') || AFRICAN_COUNTRIES[0]
  );
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [commType, setCommType] = useState<CommunicationType>('whatsapp');
  const [commValue, setCommValue] = useState('');
  const [fullName, setFullName] = useState('');
  const [deviceInfo] = useState<DeviceInfo>(() => getSimulatedDeviceInfo());

  // Token direct activation mode
  const [showTokenMode, setShowTokenMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form validation state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCountries = AFRICAN_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Veuillez renseigner votre nom complet (au moins 3 caractères).');
      return;
    }

    if (!commValue.trim()) {
      setError(
        commType === 'whatsapp'
          ? 'Veuillez saisir votre numéro WhatsApp avec ou sans indicatif.'
          : 'Veuillez saisir votre identifiant Telegram (@nom_utilisateur).'
      );
      return;
    }

    if (commType === 'telegram' && !commValue.startsWith('@') && commValue.length < 3) {
      setError('L\'identifiant Telegram doit débuter par @ (ex: @jean_dupont).');
      return;
    }

    setIsSubmitting(true);

    // Format phone with dial code if whatsapp
    let finalCommValue = commValue.trim();
    if (commType === 'whatsapp' && !finalCommValue.startsWith('+')) {
      finalCommValue = `${selectedCountry.dialCode} ${finalCommValue}`;
    }

    try {
      const newRequest = StorageService.submitRequest({
        fullName: fullName.trim(),
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        countryFlag: selectedCountry.flag,
        commType,
        commValue: finalCommValue,
        deviceInfo,
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onRequestSubmitted(newRequest.id);
      }, 700);
    } catch {
      setError('Erreur lors de la transmission de la demande au WebPanel.');
      setIsSubmitting(false);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    if (!tokenInput.trim()) {
      setTokenError('Veuillez saisir le token fourni par votre administrateur.');
      return;
    }

    const session = StorageService.loginWithToken(tokenInput.trim());
    if (session) {
      onDirectTokenLogin();
    } else {
      setTokenError('Token invalide ou non approuvé par le WebPanel Nexus Tunnel.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[#0a0f1d] via-[#090d18] to-[#05070e] text-slate-100">
      {/* Top Header & Branding */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-cyber tracking-wide text-white flex items-center gap-1.5">
                NEXUS TUNNEL <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">VLESS</span>
              </h1>
              <p className="text-[11px] text-slate-400">Client Mobile & Sécurité Chiffrée</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>WebPanel Lié</span>
          </div>
        </div>

        {/* Server host info badge */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Serveur Central VLESS Host</div>
              <div className="text-xs font-mono text-cyan-300 truncate max-w-[210px] sm:max-w-[260px]">
                nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
            TLS:443
          </span>
        </div>

        {/* Switch between Request mode & Token mode */}
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setShowTokenMode(false)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              !showTokenMode
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Nouvelle Adhésion
          </button>
          <button
            type="button"
            onClick={() => setShowTokenMode(true)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              showTokenMode
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            J'ai déjà un Token
          </button>
        </div>

        {/* MODE 1: Standard Onboarding / Demande d'adhésion */}
        {!showTokenMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Authentification & Inscription Obligatoire
              </div>

              {/* FIELD 1: Choix du pays actuel (Tous les pays africains) */}
              <div className="relative">
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>1. Choisissez votre Pays Actuel</span>
                  <span className="text-[10px] text-cyan-400 font-normal">54 Pays Africains</span>
                </label>

                {/* Country Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full bg-slate-950/90 border border-slate-700/80 hover:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between text-slate-100 transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xl leading-none">{selectedCountry.flag}</span>
                    <span className="font-semibold text-sm truncate">{selectedCountry.name}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {selectedCountry.dialCode}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>

                {/* Operators quick hints */}
                <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                  <span className="text-slate-500">Réseaux pris en charge :</span>
                  {selectedCountry.telecoms.map((tel, idx) => (
                    <span key={idx} className="bg-slate-800/60 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700/50">
                      {tel}
                    </span>
                  ))}
                </div>

                {/* Country Dropdown Modal/Menu */}
                {isCountryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0c1322] border border-cyan-500/30 rounded-xl shadow-2xl p-2 max-h-64 flex flex-col backdrop-blur-xl">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher un pays ou indicatif (+237, Bénin...)"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        autoFocus
                      />
                    </div>

                    <div className="overflow-y-auto space-y-1 flex-1 pr-1">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            selectedCountry.code === country.code
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                              : 'hover:bg-slate-800/80 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-lg leading-none">{country.flag}</span>
                            <span className="text-xs truncate">{country.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-cyan-400 shrink-0">
                            {country.dialCode}
                          </span>
                        </button>
                      ))}

                      {filteredCountries.length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          Aucun pays trouvé
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD 2: Moyen de communication */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  2. Titre Moyen de Communication
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setCommType('whatsapp')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      commType === 'whatsapp'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Numéro WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommType('telegram')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      commType === 'telegram'
                        ? 'bg-sky-950/60 border-sky-500/60 text-sky-300 shadow-md shadow-sky-950/30 ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    UID Telegram (@)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={commValue}
                    onChange={(e) => setCommValue(e.target.value)}
                    placeholder={
                      commType === 'whatsapp'
                        ? `ex: ${selectedCountry.dialCode} 699 00 11 22`
                        : 'ex: @mon_pseudo_telegram'
                    }
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                    {commType === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
                  </div>
                </div>
              </div>

              {/* FIELD 3: Nom complet d'utilisateur */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>3. Nom Complet d'Utilisateur</span>
                  <span className="text-[10px] text-slate-500">Pour attribution UID VLESS</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: Jean-Marc Tchinda"
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Detected Phone Hardware Preview */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Smartphone className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{deviceInfo.model}</span>
                </div>
                <span className="font-mono text-slate-500 shrink-0">{deviceInfo.fingerprint.substring(0, 14)}...</span>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-cyber font-bold tracking-wide py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmission au WebPanel...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SOUUMETTRE MA DEMANDE D'ACCÈS</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* MODE 2: Direct Token Login */
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Déblocage Immédiat par Token Admin / Revendeur
              </div>
              <p className="text-xs text-slate-400">
                Si un administrateur vous a déjà généré un token d'adhésion sur le WebPanel, collez-le ci-dessous pour activer immédiatement votre connexion VLESS et vos quotas.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Token d'Accès Sécurisé
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ex: NXT-7A2B-9K4M-2P8X-1V3Z"
                  className="w-full bg-slate-950 font-mono tracking-wider uppercase text-sm border border-slate-700 rounded-xl px-3.5 py-2.5 text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-lg p-2.5 text-[11px] text-cyan-300 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Exemple de token pré-approuvé pour tester :</span>
                  <div className="mt-1 font-mono text-[10px] bg-slate-900/80 p-1 rounded select-all text-slate-200">
                    NXT-7A2B-9K4M-2P8X-1V3Z
                  </div>
                </div>
              </div>
            </div>

            {tokenError && (
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{tokenError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold tracking-wide py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>DÉVERROUILLER LE VPN VIA MON TOKEN</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer security badge */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3 text-cyan-500" />
        <span>VLESS XTLS Core • Chiffrement Zero-Trust 256-bit • WebPanel Sync</span>
      </div>
    </div>
  );
};
