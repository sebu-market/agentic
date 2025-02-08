import { ModeToggle } from '@/components/mode-toggle'
import React from 'react'

export function FooterSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-6 sm:mb-0">
          <a href="/">
            <span className="text-xl sm:text-2xl italic tracking-tighter">
              sebu
            </span>
          </a>

          <span className='ml-4'>
            <ModeToggle />
          </span>
        </div>
        <div>
          <ul className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <li>
              <a href="#" className="hover:text-gray-400">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} sebu. All rights reserved.
      </div>
    </div>
  )
}