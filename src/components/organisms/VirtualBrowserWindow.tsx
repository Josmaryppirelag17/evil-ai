"use client";

import React from 'react';
import { BrowserTabState } from '@/types';
import { BrowserBar } from '@/components/molecules/BrowserBar';
import { useBrowserSimulation } from '@/hooks/useBrowserSimulation';
import { RetroButton } from '@/components/atoms/RetroButton';
import { useTranslation } from '@/lib/i18n';
import { Terminal, Shield, Globe, Compass, Code, Database, Cpu } from 'lucide-react';

interface VirtualBrowserWindowProps {
  state: BrowserTabState;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onRefresh: () => void;
  canBack: boolean;
  canForward: boolean;
}

export const VirtualBrowserWindow: React.FC<VirtualBrowserWindowProps> = ({
  state,
  isLoading,
  onNavigate,
  onBack,
  onForward,
  onHome,
  onRefresh,
  canBack,
  canForward,
}) => {
  const { viewMode, setViewMode, generatedData } = useBrowserSimulation(state);
  const { t } = useTranslation();
  const b = t.browser;

  return (
    <div className="flex flex-col h-full bg-[#03070b]/95 border border-cyber-cyan/30 text-white font-mono rounded overflow-hidden select-none">
      <div className="bg-gradient-to-r from-[#060e15] to-[#04090e] px-4 py-2 border-b border-cyber-cyan/25 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-magenta/80" aria-hidden="true" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan/80" aria-hidden="true" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-green/80" aria-hidden="true" />
          <span className="text-[10px] text-cyber-cyan/70 tracking-widest leading-none ml-2 uppercase font-medium">
            {b.windowTitle}{state.pageTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80">
          {([['rendered', b.viewRendered, Compass], ['ascii', b.viewAscii, Code], ['hex', b.viewHex, Database], ['matrix', b.viewMatrix, Cpu]] as const).map(([mode, label, Icon]) => (
            <RetroButton
              key={mode}
              variant="unstyled"
              onClick={() => setViewMode(mode)}
              className={`px-2 py-0.5 text-[8px] tracking-tight border border-cyber-cyan/30 flex items-center gap-1 ${
                viewMode === mode ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-slate-400'
              }`}
            >
              <Icon className="w-2.5 h-2.5" aria-hidden="true" />
              <span>{label}</span>
            </RetroButton>
          ))}
        </div>
      </div>

      <BrowserBar
        url={state.currentUrl}
        onNavigate={onNavigate}
        onBack={onBack}
        onForward={onForward}
        onHome={onHome}
        onRefresh={onRefresh}
        canBack={canBack}
        canForward={canForward}
        isLoading={isLoading}
      />

      <div className="flex-1 overflow-auto p-4 bg-black/80 font-mono text-xs relative select-all flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center select-none text-cyber-cyan">
            <div className="relative w-16 h-16 flex items-center justify-center border border-cyber-cyan/30 mb-4 animate-spin" aria-hidden="true">
              <div className="w-12 h-12 border border-cyber-cyan/50" />
              <div className="w-8 h-8 border border-cyber-cyan/80 absolute" />
            </div>
            <p className="tracking-widest animate-pulse font-bold uppercase text-glow-cyan text-xs">
              {b.loadingTitle}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono max-w-[280px] text-center">
              {b.loadingDesc}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {state.isCustomPage ? <CustomHomePage onNavigate={onNavigate} /> : (
              <ContentPage state={state} viewMode={viewMode} generatedData={generatedData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function CustomHomePage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { t, locale } = useTranslation();
  const b = t.browser;
  const welcomeContent = locale === "es" ? WELCOME_CONTENT_ES : WELCOME_CONTENT_EN;
  return (
    <div className="flex-1 text-slate-300 overflow-y-auto">
      <pre className="text-cyber-cyan font-mono text-[7px] md:text-[8px] leading-tight select-none opacity-80 mb-2 whitespace-pre text-center">
        {welcomeContent}
      </pre>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <HomeNavCard icon={<Terminal className="w-3.5 h-3.5 text-cyber-cyan" aria-hidden="true" />} title={b.statusTitle} description={b.statusDesc} buttonLabel={b.statusBtn} onClick={() => onNavigate('https://quantumstatus.net')} />
        <HomeNavCard icon={<Shield className="w-3.5 h-3.5 text-cyber-cyan" aria-hidden="true" />} title={b.archiveTitle} description={b.archiveDesc} buttonLabel={b.archiveBtn} onClick={() => onNavigate('https://internetarchive.org')} />
        <HomeNavCard icon={<Globe className="w-3.5 h-3.5 text-cyber-cyan" aria-hidden="true" />} title={b.gridTitle} description={b.gridDesc} buttonLabel={b.gridBtn} onClick={() => onNavigate('https://binarygrid.matrix')} />
      </div>
    </div>
  );
}

interface HomeNavCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

function HomeNavCard({ icon, title, description, buttonLabel, onClick }: HomeNavCardProps) {
  return (
    <div className="border border-cyber-cyan/20 bg-cyber-card/20 p-3 hover:border-cyber-cyan/60 hover:shadow-[0_0_8px_rgba(0,240,255,0.1)] transition-all">
      <p className="font-mono text-xs text-cyber-cyan uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <p className="font-mono text-[10px] text-slate-400 leading-normal mb-2">{description}</p>
      <button onClick={onClick} className="font-mono text-[9px] text-cyber-green hover:underline cursor-pointer uppercase">
        {buttonLabel}
      </button>
    </div>
  );
}

interface ContentPageProps {
  state: BrowserTabState;
  viewMode: 'rendered' | 'matrix' | 'ascii' | 'hex';
  generatedData: { matrixLines: string[]; hexRecords: Array<{ addr: string; hex: string; chars: string }> };
}

function ContentPage({ state, viewMode, generatedData }: ContentPageProps) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto pr-1 min-h-0">
      {viewMode === 'rendered' && <RenderedView state={state} />}
      {viewMode === 'ascii' && <AsciiView state={state} />}
      {viewMode === 'hex' && <HexView generatedData={generatedData} />}
      {viewMode === 'matrix' && <MatrixView generatedData={generatedData} />}
    </div>
  );
}

function RenderedView({ state }: { state: BrowserTabState }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="p-3 border border-cyber-cyan/20 bg-cyber-cyan/5 text-cyber-cyan relative">
        <span className="absolute top-1 right-2 text-[8px] opacity-50">{t.browser.nodeReader}</span>
        <p className="font-bold text-xs tracking-wider uppercase">{state.pageTitle}</p>
        <p className="text-[9px] text-gray-500 truncate mt-0.5">{state.currentUrl}</p>
      </div>
      <div className="bg-black/40 border border-cyber-cyan/15 p-4 rounded-sm">
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-100 select-all">
          {state.pageContent}
        </pre>
      </div>
    </div>
  );
}

function AsciiView({ state }: { state: BrowserTabState }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="p-3 border border-cyber-magenta/20 bg-cyber-magenta/5 text-cyber-magenta mb-2">
        <p className="font-bold text-xs uppercase">{t.browser.asciiTitle}</p>
        <p className="text-[9px] opacity-60">{t.browser.asciiDesc}</p>
      </div>
      <div className="bg-black/70 border border-cyber-magenta/30 p-4 rounded text-cyber-green font-mono text-[9px] overflow-auto leading-tight select-none">
        <pre className="text-cyber-cyan leading-tight select-none">
{`+-----------------------------------------------------------------+
| [HEADER] :: ${state.pageTitle.padEnd(52, ' ')} |
+-----------------------------------------------------------------+
| URL: ${state.currentUrl.padEnd(59, ' ')} |
+-----------------------------------------------------------------+
|                                                                 |
|  /\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\  |
|  \\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_/  |
|                                                                 |
|  [DATA_BLOCK_SECTOR_0]                                          |
|  Active payload status: DECRYPTED                               |
|  Node classification: INFORMATIONAL_INDEX                       |
|                                                                 |
|  [SITE CONTENTS CAPTURES]:                                      |
|  - Summaries recuperated successfully                           |
|  - Frame indices locked                                         |
|  - Terminal view enabled                                        |
|                                                                 |
+-----------------------------------------------------------------+
| [FOOTER] :: MATRIX_CONNECTED // SYSTEM_HEALTH_OK               |
+-----------------------------------------------------------------+`}
        </pre>
      </div>
    </div>
  );
}

function HexView({ generatedData }: { generatedData: { hexRecords: Array<{ addr: string; hex: string; chars: string }> } }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      <div className="p-2.5 border border-cyber-green/20 bg-cyber-green/5 text-cyber-green">
        <p className="font-bold text-xs uppercase">{t.browser.hexTitle}</p>
        <p className="text-[9px] opacity-60">{t.browser.hexDesc}</p>
      </div>
      <div className="bg-black/75 border border-cyber-green/30 p-4 rounded font-mono text-xs text-cyber-green overflow-y-auto max-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyber-green/20 text-[10px] uppercase text-cyber-green/60">
              <th className="py-1">{t.browser.hexOffset}</th>
              <th className="py-1">{t.browser.hexBuffer}</th>
              <th className="py-1">{t.browser.hexRecovery}</th>
            </tr>
          </thead>
          <tbody>
            {generatedData.hexRecords.map((rec, i) => (
              <tr key={i} className="hover:bg-cyber-green/10 transition-colors">
                <td className="py-0.5 text-cyber-cyan font-bold">{rec.addr}</td>
                <td className="py-0.5 tracking-widest text-cyber-green">{rec.hex}</td>
                <td className="py-0.5 text-slate-400 border-l border-cyber-green/15 pl-3">{rec.chars}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixView({ generatedData }: { generatedData: { matrixLines: string[] } }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col space-y-4 min-h-0">
      <div className="p-2.5 border border-cyber-cyan/20 bg-cyber-cyan/5 text-cyber-cyan">
        <p className="font-bold text-xs uppercase">{t.browser.matrixTitle}</p>
        <p className="text-[9px] opacity-60">{t.browser.matrixDesc}</p>
      </div>
      <div className="flex-1 bg-black/80 border border-cyber-cyan/30 p-4 rounded flex flex-col items-center justify-center font-mono text-xs text-cyber-cyan overflow-hidden min-h-[180px] select-none text-glow-cyan">
        {generatedData.matrixLines.map((line, idx) => (
          <div key={idx} className="opacity-75 tracking-widest leading-none my-0.5 truncate text-center w-full">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

const WELCOME_CONTENT_ES = `
__      __        _     _  __      __ _     _       __      __      _     
\\ \\    / /  ___  | |   | | \\ \\    / /(_)   | |      \\ \\    / / ___ | |__  
 \\ \\  / /  / _ \\ | |   | |  \\ \\  / /  _  __| |  ___  \\ \\  / / / _ \\| '_ \\ 
  \\ \\/ /  | (_) || |__ | |   \\ \\/ /  | |/ _\` | / _ \\  \\ \\/ / |  __/| |_) |
   \\__/    \\___/ \\____||_|    \\__/   |_|\\__,_| \\___/   \\__/   \\___||_.__/ 
                                                                            
================ PROTOCOLO DE ACCESO HÍBRIDO MULTI-DATOS v1.0 ================
PUERTO: 3000 // SISTEMA DE DESENCRIPTADO: SHIELD-SEGURO // NODOS CONECTADOS: ACTIVO

¡Estás explorando la World Wide Web en vivo con captura de datos cuánticos!
Envía un comando a CYBERCORE_AI en el panel de chat izquierdo.
Cuando la IA busca en la web, las referencias aparecen debajo de los mensajes
como chips de acceso al Mapa de Nodos Web.

[LISTA DE OPERACIONES DEL SISTEMA]:
- CLIC EN UN DATANODE WEB: Activa la extracción de contenido del sitio en el servidor.
- MODO DE BÚSQUEDA DIRECTA: Ingresa cualquier URL en la barra de direcciones para simular.
- CAMBIO DE MODO DE VISTA: Alterna entre contexto de texto plano, nodos hexadecimales,
  tramas ASCII tácticas o cuadrículas de secuencia binaria.

------------------------------ DESCUBRE EL DIRECTORIO FLOTANTE ------------------------------
Esperando sesión de comando segura... [ESCUCHANDO_INACTIVO]
  `;

const WELCOME_CONTENT_EN = `
__      __        _     _  __      __ _     _       __      __      _     
\\ \\    / /  ___  | |   | | \\ \\    / /(_)   | |      \\ \\    / / ___ | |__  
 \\ \\  / /  / _ \\ | |   | |  \\ \\  / /  _  __| |  ___  \\ \\  / / / _ \\| '_ \\ 
  \\ \\/ /  | (_) || |__ | |   \\ \\/ /  | |/ _\` | / _ \\  \\ \\/ / |  __/| |_) |
   \\__/    \\___/ \\____||_|    \\__/   |_|\\__,_| \\___/   \\__/   \\___||_.__/ 
                                                                            
================ MULTI-HYBRID DATA ACCESS PROTOCOL v1.0 ================
PORT LINK: 3000 // DECRYPT SYSTEM: SHIELD-SECURE // NODES CONNECTED: ACTIVE

You are exploring the live World Wide Web using search-grounded quantum data capture!
Submit a prompt to CYBERCORE_AI on the left sidebar chat screen.
When the AI searches the web for answers, search references appear beneath the messages
as Grounded Web Nodemap access chips.

[SYSTEM OPERATIONS LIST]:
- CLIK A WEB DATANODE: Triggers server-side content extraction rendering the website.
- DIRECT SEARCH MODE: Enter any URL in the browser address layout above to simulate.
- VIEWER MODE TOGGLE: Switch between rendered plaintext context, raw hexadecimal nodes,
  tactical ASCII frames, or falling binary sequence grids.

------------------------------ DISCOVER HOVER DIRECTORY ------------------------------
Awaiting secure command session... [IDLE_LISTENING]
  `;
