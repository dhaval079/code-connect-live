"use client"
import React, { useState } from "react"
import {
  Bot, Check, MessageCircle, X, Trash2, Bell,
  Settings, Palette, Shield, ChevronRight, 
  Moon, Sun, Type, Smartphone, Key, Database,
  Volume2, Eye, Zap, Star, Globe
} from "lucide-react"

export interface Settings {
  theme: 'dark' | 'light'
  fontSize: 'small' | 'medium' | 'large'
  voiceEnabled: boolean
  autoScroll: boolean
  showTimestamps: boolean
  compactMode: boolean
}

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}: {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  isOpen: boolean
  onClose: () => void
}) => {
  const isDark = settings.theme === 'dark'

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange, label, description, icon, accent = 'blue' }: {
    enabled: boolean
    onChange: (enabled: boolean) => void
    label: string
    description?: string
    icon?: React.ReactNode
    accent?: string
  }) => (
    <div className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
      isDark 
        ? 'bg-gray-800/60 hover:bg-gray-800/80' 
        : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
            accent === 'blue' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') :
            accent === 'purple' ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600') :
            accent === 'green' ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') :
            accent === 'orange' ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600') :
            (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
          }`}>
            {icon}
          </div>
        )}
        <div>
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {label}
          </div>
          {description && (
            <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          enabled 
            ? (accent === 'blue' ? 'bg-blue-500 focus:ring-blue-500' :
               accent === 'purple' ? 'bg-purple-500 focus:ring-purple-500' :
               accent === 'green' ? 'bg-green-500 focus:ring-green-500' :
               accent === 'orange' ? 'bg-orange-500 focus:ring-orange-500' :
               'bg-blue-500 focus:ring-blue-500')
            : (isDark ? 'bg-gray-600 focus:ring-gray-500' : 'bg-gray-300 focus:ring-gray-300')
        } ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  // Select Component
  const SelectOption = ({ value, onChange, options, label, icon }: {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string; icon?: React.ReactNode }[]
    label: string
    icon?: React.ReactNode
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selected = options.find(opt => opt.value === value)

    return (
      <div className={`p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
        isDark 
          ? 'bg-gray-800/60 hover:bg-gray-800/80' 
          : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}>
                {icon}
              </div>
            )}
            <div>
              <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {label}
              </div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {selected?.label}
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{selected?.label}</span>
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {isOpen && (
              <div className={`absolute right-0 top-full mt-1 w-32 rounded-md shadow-lg z-50 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-xs hover:bg-opacity-50 transition-colors ${
                      value === option.value 
                        ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                        : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Navigation Item
  const NavItem = ({ icon, label, description, onClick, accent = 'gray' }: {
    icon: React.ReactNode
    label: string
    description?: string
    onClick?: () => void
    accent?: string
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
        isDark 
          ? 'bg-gray-800/60 hover:bg-gray-800/80' 
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
          accent === 'red' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') :
          accent === 'yellow' ? (isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600') :
          (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
        }`}>
          {icon}
        </div>
        <div className="text-left">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {label}
          </div>
          {description && (
            <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
    </button>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden transition-all duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Theme Toggle */}
          <ToggleSwitch
            enabled={settings.theme === 'dark'}
            onChange={(enabled) => onSettingsChange({ ...settings, theme: enabled ? 'dark' : 'light' })}
            label="Dark Mode"
            description="Toggle between light and dark themes"
            icon={settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            accent="blue"
          />

          {/* Font Size */}
          <SelectOption
            value={settings.fontSize}
            onChange={(value) => onSettingsChange({ ...settings, fontSize: value as 'small' | 'medium' | 'large' })}
            label="Font Size"
            icon={<Type className="w-4 h-4" />}
            options={[
              { value: 'small', label: 'Small', icon: <Type className="w-3 h-3" /> },
              { value: 'medium', label: 'Medium', icon: <Type className="w-4 h-4" /> },
              { value: 'large', label: 'Large', icon: <Type className="w-5 h-5" /> },
            ]}
          />

          {/* Chat Settings */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium px-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Chat Preferences
            </h3>
            <ToggleSwitch
              enabled={settings.autoScroll}
              onChange={(enabled) => onSettingsChange({ ...settings, autoScroll: enabled })}
              label="Auto Scroll"
              description="Scroll to new messages automatically"
              icon={<MessageCircle className="w-4 h-4" />}
              accent="green"
            />
            <ToggleSwitch
              enabled={settings.showTimestamps}
              onChange={(enabled) => onSettingsChange({ ...settings, showTimestamps: enabled })}
              label="Show Timestamps"
              description="Display message timestamps"
              icon={<Eye className="w-4 h-4" />}
              accent="purple"
            />
            <ToggleSwitch
              enabled={settings.compactMode}
              onChange={(enabled) => onSettingsChange({ ...settings, compactMode: enabled })}
              label="Compact Mode"
              description="Use less space between messages"
              icon={<Database className="w-4 h-4" />}
              accent="orange"
            />
          </div>

          {/* Advanced Settings */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium px-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Advanced
            </h3>
            <NavItem
              icon={<Shield className="w-4 h-4" />}
              label="Privacy & Security"
              description="Manage data and security settings"
            />
            <NavItem
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
              description="Configure notification preferences"
            />
            <NavItem
              icon={<Globe className="w-4 h-4" />}
              label="Language & Region"
              description="Set language and regional preferences"
            />
            <NavItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Reset Settings"
              description="Clear all data and reset to defaults"
              accent="red"
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Changes are saved automatically
          </div>
        </div>
      </div>
    </div>
  )
}