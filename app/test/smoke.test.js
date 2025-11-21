/**
 * Smoke Tests - Basic validation that core modules load correctly
 * These tests ensure the application can start in a CI environment
 */

describe('Smoke Tests', () => {
  describe('Core Dependencies', () => {
    it('should load express module', () => {
      const express = require('express');
      expect(express).toBeDefined();
      expect(typeof express).toBe('function');
    });

    it('should load dotenv module', () => {
      const dotenv = require('dotenv');
      expect(dotenv).toBeDefined();
      expect(dotenv.config).toBeDefined();
    });

    it('should load pg module', () => {
      const { Pool } = require('pg');
      expect(Pool).toBeDefined();
      expect(typeof Pool).toBe('function');
    });

    it('should load ws module', () => {
      const { WebSocketServer } = require('ws');
      expect(WebSocketServer).toBeDefined();
      expect(typeof WebSocketServer).toBe('function');
    });

    it('should load yjs module', () => {
      const Y = require('yjs');
      expect(Y).toBeDefined();
      expect(Y.Doc).toBeDefined();
    });
  });

  describe('Application Structure', () => {
    it('should have valid package.json', () => {
      const packageJson = require('../package.json');
      expect(packageJson.name).toBe('azure-psql-app');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.dependencies).toBeDefined();
    });

    it('should have required dependencies installed', () => {
      const packageJson = require('../package.json');
      const requiredDeps = ['express', 'pg', 'ws', 'yjs', 'dotenv'];

      requiredDeps.forEach((dep) => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should set NODE_ENV to test in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should have required scripts in package.json', () => {
      const packageJson = require('../package.json');
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
    });
  });
});
