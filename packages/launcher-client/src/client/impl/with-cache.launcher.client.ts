import { LauncherClient } from '../launcher.client';
import {
  AnalyzeResult,
  AnyExample,
  AuthorizationTokenProvider,
  Capability,
  Catalog,
  DownloadAppPayload,
  DownloadAppResult,
  Enums,
  ExistsResult,
  GitInfo,
  GitProvider,
  GitRepositoryExistsPayload,
  LaunchAppPayload,
  LaunchAppResult,
  OCExistsProjectPayload,
  OpenShiftCluster,
  PropertyValue,
  StatusListener
} from '../types';
import { filter } from '../..';
import lscache from 'lscache';

const DURATION = 24 * 3600000;

export default class WithCacheLauncherClient implements LauncherClient {
  constructor(private readonly client: LauncherClient) {
  }

  public get authorizationTokenProvider() {
    return this.client.authorizationTokenProvider;
  }

  public set authorizationTokenProvider(authorizationTokenProvider: AuthorizationTokenProvider) {
    this.client.authorizationTokenProvider = authorizationTokenProvider;
  }

  public async capabilities(): Promise<Capability[]> {
    let capabilities = lscache.get('launcher-client.capabilities');
    if (!capabilities) {
      capabilities = await this.client.capabilities();
      lscache.set('launcher-client.capabilities', capabilities, DURATION);
    }
    return capabilities;
  }

  public async enum(id: string): Promise<PropertyValue[]> {
    const enums = await this.enums();
    return enums[id] || [];
  }

  public async enums(): Promise<Enums> {
    let enums = lscache.get('launcher-client.enums');
    if (!enums) {
      enums = await this.client.enums();
      lscache.set('launcher-client.enums', enums, DURATION);
    }
    return enums;
  }

  public async exampleCatalog(): Promise<Catalog> {
    let catalog = lscache.get('launcher-client.catalog');
    if (!catalog) {
      catalog = await this.client.exampleCatalog();
      lscache.set('launcher-client.catalog', catalog, DURATION);
    }
    return catalog;
  }

  public async findExampleApps(query: AnyExample): Promise<AnyExample[]> {
    return filter(query, await this.exampleCatalog());
  }

  public async gitInfo(): Promise<GitInfo> {
    return this.client.gitInfo();
  }

  public async gitProviders(): Promise<GitProvider[]> {
    let gitProviders = lscache.get('launcher-client.git-providers');
    if (!gitProviders) {
      gitProviders = await this.client.gitProviders();
      lscache.set('launcher-client.git-providers', gitProviders, DURATION);
    }
    return gitProviders;
  }

  public async gitRepositoryExists(payload: GitRepositoryExistsPayload): Promise<ExistsResult> {
    return this.client.gitRepositoryExists(payload);
  }

  public async ocClusters(): Promise<OpenShiftCluster[]> {
    return this.client.ocClusters();
  }

  public async download(payload: DownloadAppPayload): Promise<DownloadAppResult> {
    return this.client.download(payload);
  }

  public async ocExistsProject(payload: OCExistsProjectPayload): Promise<ExistsResult> {
    return this.client.ocExistsProject(payload);
  }

  public follow(id: string, events: Array<{ name: string }>, listener: StatusListener) {
    return this.client.follow(id, events, listener);
  }

  public async importAnalyze(gitImportUrl: string): Promise<AnalyzeResult> {
    return this.client.importAnalyze(gitImportUrl);
  }

  public async launch(payload: LaunchAppPayload): Promise<LaunchAppResult> {
    return this.client.launch(payload);
  }
}
